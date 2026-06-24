/** User profile entity (no framework dependencies). */
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  savedPrompts: SavedPrompt[] | null;
  createdAt: Date;
}

/** A personalized prompt saved to the user's profile for reuse. */
export interface SavedPrompt {
  id: number;
  text: string;
}
