const commanderCodyConfig = {
  googleFormUrl: "",
  tipLinks: [
    { label: "Venmo", url: "" },
    { label: "PayPal", url: "" },
    { label: "Cash App", url: "" },
  ],
  youtubeVideoIds: [
    { id: "qyrUCCS2z_U", start: 123 },
    "u-qbgbAf-PA",
    "cI8FdtjepBc",
  ],
};

const isLiveUrl = (value) => {
  if (!value || typeof value !== "string") {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const isYouTubeId = (value) => {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{11}$/.test(value.trim());
};

const getYouTubeEmbedUrl = (id, start = 0) => {
  const params = new URLSearchParams({
    playsinline: "1",
    rel: "0",
  });

  if (Number.isInteger(start) && start > 0) {
    params.set("start", String(start));
  }

  if (window.location.origin && window.location.origin !== "null") {
    params.set("origin", window.location.origin);
  }

  return `https://www.youtube.com/embed/${encodeURIComponent(id)}?${params.toString()}`;
};

const normalizeYouTubeVideo = (video) => {
  if (isYouTubeId(video)) {
    return { id: video.trim(), start: 0 };
  }

  if (!video || typeof video !== "object" || !isYouTubeId(video.id)) {
    return null;
  }

  return {
    id: video.id.trim(),
    start: Number.isInteger(video.start) && video.start > 0 ? video.start : 0,
  };
};

const setDisabledLink = (link, label) => {
  link.href = "#";
  link.setAttribute("aria-disabled", "true");
  link.setAttribute("tabindex", "-1");
  link.dataset.disabled = "true";
  if (label) {
    link.textContent = label;
  }
};

const wireExternalLinks = () => {
  const formLinks = document.querySelectorAll(".js-google-form-link");
  formLinks.forEach((link) => {
    if (isLiveUrl(commanderCodyConfig.googleFormUrl)) {
      link.href = commanderCodyConfig.googleFormUrl;
      link.target = "_blank";
      link.rel = "noopener";
    } else {
      setDisabledLink(link, "Request Form Coming Soon");
    }
  });
};

const renderVideos = () => {
  const videoGrid = document.querySelector(".js-video-grid");
  if (!videoGrid) {
    return;
  }

  const videos = commanderCodyConfig.youtubeVideoIds
    .map(normalizeYouTubeVideo)
    .slice(0, 3);

  const validVideos = videos.filter(Boolean);

  if (!validVideos.length) {
    const placeholders = ["Featured clip", "Live set", "Recent performance"];
    videoGrid.innerHTML = placeholders
      .map((label) => `<div class="video-placeholder">${label} coming soon</div>`)
      .join("");
    return;
  }

  videoGrid.innerHTML = validVideos
    .map((video, index) => {
      const safeId = encodeURIComponent(video.id);
      const embedUrl = getYouTubeEmbedUrl(video.id, video.start);
      const watchUrl = `https://www.youtube.com/watch?v=${safeId}${video.start ? `&t=${video.start}s` : ""}`;
      return `
        <div class="video-card">
          <iframe
            class="video-frame"
            src="${embedUrl}"
            title="Commander Cody performance video ${index + 1}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
          <a class="video-link" href="${watchUrl}" target="_blank" rel="noopener">
            Watch on YouTube
          </a>
        </div>
      `;
    })
    .join("");
};

const renderTips = () => {
  const tipLinks = document.querySelector(".js-tip-links");
  if (!tipLinks) {
    return;
  }

  tipLinks.innerHTML = commanderCodyConfig.tipLinks
    .map((tip) => {
      const label = tip.label || "Tip link";
      if (isLiveUrl(tip.url)) {
        return `<a class="button button-primary" href="${tip.url}" target="_blank" rel="noopener">Tip via ${label}</a>`;
      }

      return `<a class="button button-text" href="#" aria-disabled="true" tabindex="-1">Tip via ${label} Coming Soon</a>`;
    })
    .join("");
};

wireExternalLinks();
renderVideos();
renderTips();
