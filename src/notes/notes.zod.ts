import { z } from 'zod';

const createNoteZod = z
  .object({
    title: z.string().optional().nullable(),
    paragraph: z.string().optional().nullable(),
  })
  .refine((data) => data.title || data.paragraph, {
    message: "At least one of 'title' or 'paragraph' is required.",
    path: ['title', 'paragraph'],
  });

export { createNoteZod };
