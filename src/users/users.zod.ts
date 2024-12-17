import { z } from 'zod';

const createUser = z.object({
  name: z
    .string({ message: 'You have not provided a name.' })
    .min(1, 'You have not provided a valid name.'),
  email: z
    .string({ message: 'You have not provided an email.' })
    .email('Invalid email format.'),
  password: z
    .string({ message: 'You have not provided a password.' })
    .min(6, 'Password needs to be atleast of 6 characters.'),
});

export { createUser };
