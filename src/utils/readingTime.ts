function readingTime(content: string) {
  const wpm = 200;
  const words = content.trim().split(/\s+/).length;
  const time = Math.ceil(words / wpm);
  return time + " min read";
}

export default readingTime;
