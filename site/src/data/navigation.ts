import { getUrl } from '../utils/url';

export interface NavItem {
  label: string;
  href: string;
  subitems?: NavItem[];
}

export const navItems: NavItem[] = [
  { label: '首页', href: getUrl('') },
  { label: '课程大纲', href: getUrl('curriculum') },
  { label: '工具生态', href: getUrl('tools') },
  { label: '实战项目', href: getUrl('projects') },
  { label: '学习资料', href: getUrl('materials') },
  { label: '演示文稿', href: getUrl('presentations') },
  { label: '关于', href: getUrl('about') },
];
