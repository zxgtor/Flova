export type Template = {
  slug: string;
  title: string;
  description: string;
  image: string;
  popular: boolean;
};

// Static placeholder data; replaced by a real templates API in a later group.
export const TEMPLATES: Template[] = [
  {
    slug: "script_to_video",
    title: "Script to Video",
    description: "Convert text into a compelling visual story.",
    image: "/mockups/templates/script-to-video.png",
    popular: true,
  },
  {
    slug: "cinematic_story",
    title: "Cinematic Story",
    description: "Generate epic narratives with a Hollywood touch.",
    image: "/mockups/templates/cinematic-story.png",
    popular: true,
  },
  {
    slug: "reference_video_remix",
    title: "Reference Video Remix",
    description: "Transform existing footage with AI effects.",
    image: "/mockups/templates/reference-remix.png",
    popular: true,
  },
  {
    slug: "music_video",
    title: "Music Video",
    description: "Create dynamic visuals synchronized to audio.",
    image: "/mockups/templates/music-video.png",
    popular: true,
  },
];
