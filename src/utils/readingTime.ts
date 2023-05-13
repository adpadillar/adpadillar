function readingTime(content: string) {
  const wpm = 200;
  const words = content.trim().split(/\s+/).length;
  const time = Math.ceil(words / wpm);
  return `${time.toString()} min read` as const;
}

export default readingTime;
