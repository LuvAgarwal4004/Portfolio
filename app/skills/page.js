import { Cinzel, Cormorant } from "next/font/google";
import SkillsView from "@/components/horror/views/SkillsView";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-tarot-display",
});

const cormorant = Cormorant({
  subsets: ["latin"],
  variable: "--font-tarot-body",
});

export const metadata = {
  title: "Skills | The Unknown Room",
  description:
    "Haunted dull-chromic tarot cards detailing Fullstack Web Development, Cross-Platform Apps, and Cybersecurity.",
};

export default function SkillsPage() {
  return (
    <div className={`${cinzel.variable} ${cormorant.variable}`}>
      <SkillsView
        displayFontFamily={cinzel.style.fontFamily}
        bodyFontFamily={cormorant.style.fontFamily}
      />
    </div>
  );
}
