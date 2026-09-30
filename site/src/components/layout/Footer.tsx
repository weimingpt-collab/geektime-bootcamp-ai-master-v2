import { Github } from 'lucide-react';

import { getUrl } from '../../utils/url';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    课程: [
      { label: '课程大纲', href: 'curriculum' },
      { label: '工具生态', href: 'tools' },
      { label: '实战项目', href: 'projects' },
      { label: '学习资料', href: 'materials' },
    ],
    资料: [
      { label: 'Claude Code 架构', href: 'materials/claude-code-architecture' },
      { label: '工具对比', href: 'materials/ai-coding-tools-comparison' },
      { label: 'NotebookLM', href: 'materials/notebooklm-guide' },
    ],
    关于: [
      { label: '课程价值', href: 'about#value' },
      { label: '适合人群', href: 'about#audience' },
      { label: '讲师介绍', href: 'about#instructor' },
    ],
  };

  const socialLinks = [
    { icon: Github, href: 'https://github.com/tyrchen/geektime-bootcamp-ai', label: 'GitHub' },
  ];

  return (
    <footer className="mt-12 border-t-2 border-graphite bg-cloud">
      <div className="py-12 md-container">
        <div className="grid grid-cols-1 gap-2 mb-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <h3 className="text-h3 font-bold uppercase tracking-[0.08em] bg-gradient-to-tr from-sunbeam to-sky text-transparent bg-clip-text mb-6">
              陈天 AI 训练营
            </h3>
            <p className="mb-6 text-body text-slate">
              让 AI 成为你的编程超能力
            </p>
            <span className="md-badge">✨ 8周精通 AI 编程</span>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-body font-bold uppercase tracking-[0.08em] text-ink mb-6">
                {category}
              </h4>
              <ul className="flex flex-col gap-5 text-body text-slate">
                {links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={getUrl(link.href)}
                      className="inline-flex gap-2 items-center pb-1 border-b-2 border-transparent transition-colors duration-150 hover:border-graphite hover:text-ink"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-8 items-center border-t-2 border-graphite pt-space-10 text-ui text-slate md:flex-row md:justify-between">
          <p>© {currentYear} 陈天极客时间 AI 训练营 • All rights reserved.</p>
          <div className="flex gap-8 items-center">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border-0 transition-transform duration-150 rounded-micro text-ink hover:-translate-y-1 hover:bg-softBlue"
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
