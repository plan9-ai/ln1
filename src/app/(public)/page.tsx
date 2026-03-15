"use client";

import {
  SiApple,
  SiFacebook,
  SiGithub,
  SiGoogle,
  SiInstagram,
  SiX,
  SiYoutube,
} from "@icons-pack/react-simple-icons";
import Link from "next/link";
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from "@/components/kibo-ui/announcement";
import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@/components/kibo-ui/marquee";
import { Button } from "@/components/ui/button";

const logos = [
  {
    name: "GitHub",
    icon: SiGithub,
    url: "https://github.com",
  },
  {
    name: "Facebook",
    icon: SiFacebook,
    url: "https://facebook.com",
  },
  {
    name: "Google",
    icon: SiGoogle,
    url: "https://google.com",
  },
  {
    name: "X",
    icon: SiX,
    url: "https://x.com",
  },
  {
    name: "Apple",
    icon: SiApple,
    url: "https://apple.com",
  },
  {
    name: "Instagram",
    icon: SiInstagram,
    url: "https://instagram.com",
  },
  {
    name: "YouTube",
    icon: SiYoutube,
    url: "https://youtube.com",
  },
];

const LandingPage = () => (
  <div className="flex flex-col gap-16 px-8 pt-12 pb-24 text-center">
    <div className="flex flex-col items-center justify-center gap-8">
      <Link href="#">
        <Announcement>
          <AnnouncementTag>Latest</AnnouncementTag>
          <AnnouncementTitle>Introducing LN1</AnnouncementTitle>
        </Announcement>
      </Link>
      <h1 className="mb-0 flex flex-wrap text-balance font-bold text-6xl md:text-7xl xl:text-[5.25rem]">
        Free open source alternative to Linear
      </h1>
      <p className="mt-0 mb-0 text-balance text-lg text-muted-foreground">
        A free, open-source project management tool. Track issues, manage
        projects, and collaborate with your team. Self-hosted or cloud-based.
        MCP server support.
      </p>
      <p className="mt-0 mb-0 text-balance text-lg text-muted-foreground">
        We build this for teams that need it. Show your support on Open
        Collective or become a sponsor. Funds go to servers and salaries. All
        features are always free in both cloud and self-hosted versions.
      </p>
      <div className="flex items-center gap-2">
        <Button asChild>
          <Link href="/signup">Get started</Link>
        </Button>
        <Button asChild variant="outline">
          <Link className="no-underline" href="/login">
            Learn more
          </Link>
        </Button>
      </div>
    </div>
    <section className="flex flex-col items-center justify-center gap-8 rounded-xl bg-secondary py-8 pb-18">
      <p className="mb-0 text-balance font-medium text-muted-foreground">
        Trusted by developers from leading companies
      </p>
      <div className="flex size-full items-center justify-center">
        <Marquee>
          <MarqueeFade className="from-secondary" side="left" />
          <MarqueeFade className="from-secondary" side="right" />
          <MarqueeContent pauseOnHover={false}>
            {logos.map((logo) => (
              <MarqueeItem className="mx-16 size-12" key={logo.name}>
                <Link href={logo.url}>
                  <logo.icon className="size-full" />
                </Link>
              </MarqueeItem>
            ))}
          </MarqueeContent>
        </Marquee>
      </div>
    </section>
  </div>
);

export default LandingPage;
