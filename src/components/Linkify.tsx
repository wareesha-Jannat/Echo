import Link from "next/link";
import React from "react";
import { LinkIt, LinkItUrl } from "react-linkify-it";
import UserLinkWithTooltip from "./UserLinkWithTooltip";

interface LinkifyProps {
  children: React.ReactNode;
}

const Linkify = ({ children }: LinkifyProps) => {
  return (
    <div>
      <LinkifyHashtag>
        <LinkifyUsername>
          <LinkifyUrl>{children}</LinkifyUrl>
        </LinkifyUsername>
      </LinkifyHashtag>
    </div>
  );
};

export default Linkify;

function LinkifyUrl({ children }: LinkifyProps) {
  return (
    <LinkItUrl className="text-primary hover: underline">{children}</LinkItUrl>
  );
}

function LinkifyUsername({ children }: LinkifyProps) {
  return (
    <LinkIt
      regex={/(@[a-zA-Z0-9_-]+)/}
      component={(match, key) => (
        <UserLinkWithTooltip key={key} username={match.slice(1)}>
          {match}
        </UserLinkWithTooltip>
      )}
    >
      {children}
    </LinkIt>
  );
}

function LinkifyHashtag({ children }: LinkifyProps) {
  return (
    <LinkIt
      regex={/(#[a-zA-Z0-9_-]+)/}
      component={(match, key) => (
        <Link
          key={key}
          href={`/search?q=${encodeURIComponent("#" + match.slice(1))}`}
          className="text-primary hover: underline"
        >
          {match}
        </Link>
      )}
    >
      {children}
    </LinkIt>
  );
}
