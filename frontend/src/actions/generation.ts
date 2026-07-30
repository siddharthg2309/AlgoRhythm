"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { inngest } from "~/inngest/client";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "~/env";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface GenerateRequest {
  prompt?: string;
  lyrics?: string;
  fullDescribedSong?: string;
  describedLyrics?: string;
  instrumental?: boolean;
}

type GenerationStage = "preview" | "full";

const generationProfiles = {
  preview: {
    audioDuration: 45,
    inferStep: 25,
  },
  full: {
    audioDuration: 180,
    inferStep: 60,
  },
} as const;

export async function generateSong(generateRequest: GenerateRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth/sign-in");

  await queueSong(generateRequest, 15, session.user.id, "preview");

  revalidatePath("/create");
}

export async function approvePreview(previewSongId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth/sign-in");

  const preview = await db.song.findFirstOrThrow({
    where: {
      id: previewSongId,
      userId: session.user.id,
      generationStage: "preview",
      status: "processed",
    },
    select: {
      prompt: true,
      lyrics: true,
      fullDescribedSong: true,
      describedLyrics: true,
      instrumental: true,
    },
  });

  const existingFullTrack = await db.song.findFirst({
    where: {
      sourceSongId: previewSongId,
      userId: session.user.id,
    },
    select: { id: true },
  });

  if (existingFullTrack) {
    return existingFullTrack.id;
  }

  const fullTrack = await queueSong(
    {
      prompt: preview.prompt ?? undefined,
      lyrics: preview.lyrics ?? undefined,
      fullDescribedSong: preview.fullDescribedSong ?? undefined,
      describedLyrics: preview.describedLyrics ?? undefined,
      instrumental: preview.instrumental,
    },
    15,
    session.user.id,
    "full",
    previewSongId,
  );

  revalidatePath("/create");
  return fullTrack.id;
}

export async function queueSong(
  generateRequest: GenerateRequest,
  guidanceScale: number,
  userId: string,
  generationStage: GenerationStage = "preview",
  sourceSongId?: string,
) {
  let title = "Untitled";
  if (generateRequest.describedLyrics) title = generateRequest.describedLyrics;
  if (generateRequest.fullDescribedSong)
    title = generateRequest.fullDescribedSong;

  title = title.charAt(0).toUpperCase() + title.slice(1);

  const song = await db.song.create({
    data: {
      userId: userId,
      title: title,
      prompt: generateRequest.prompt,
      lyrics: generateRequest.lyrics,
      describedLyrics: generateRequest.describedLyrics,
      fullDescribedSong: generateRequest.fullDescribedSong,
      instrumental: generateRequest.instrumental,
      guidanceScale: guidanceScale,
      audioDuration: generationProfiles[generationStage].audioDuration,
      inferStep: generationProfiles[generationStage].inferStep,
      generationStage,
      sourceSongId,
    },
  });

  await inngest.send({
    name: "generate-song-event",
    data: { songId: song.id, userId: song.userId },
  });

  return song;
}

export async function getPlayUrl(songId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth/sign-in");

  const song = await db.song.findUniqueOrThrow({
    where: {
      id: songId,
      OR: [{ userId: session.user.id }, { published: true }],
      s3Key: {
        not: null,
      },
    },
    select: {
      s3Key: true,
    },
  });

  await db.song.update({
    where: {
      id: songId,
    },
    data: {
      listenCount: {
        increment: 1,
      },
    },
  });

  return await getPresignedUrl(song.s3Key!);
}

export async function getPresignedUrl(key: string) {
  const s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, {
    expiresIn: 3600,
  });
}
