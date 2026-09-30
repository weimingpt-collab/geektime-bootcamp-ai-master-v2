/**
 * 获取带有正确 base 路径的 URL
 * @param path - 相对路径（不要以 / 开头，除非是根路径）
 * @returns 完整的 URL 路径
 *
 * @example
 * // 开发环境：getUrl('about') => '/about'
 * // GitHub Pages：getUrl('about') => '/geektime-bootcamp-ai/about'
 */
export function getUrl(path: string): string {
  const base = import.meta.env.BASE_URL;

  // 如果是根路径
  if (path === '' || path === '/') {
    return base;
  }

  // 移除开头的 /（如果有）
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // 确保 base 以 / 结尾
  const baseWithSlash = base.endsWith('/') ? base : `${base}/`;

  return `${baseWithSlash}${cleanPath}`;
}

/**
 * 获取图片 URL
 * @param imagePath - 图片路径（相对于 public 目录）
 * @returns 完整的图片 URL
 */
export function getImageUrl(imagePath: string): string {
  return getUrl(imagePath);
}
