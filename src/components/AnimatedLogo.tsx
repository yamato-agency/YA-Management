'use client';

import Image from 'next/image';

export default function AnimatedLogo() {
  return (
    <div className="flex items-center space-x-3">
      {/* アニメーションGIF */}
      <div className="relative w-12 h-12 flex-shrink-0">
        <Image
          src="/images/animation.gif"
          alt="アニメーションロゴ"
          width={48}
          height={48}
          className="object-contain"
          priority
        />
      </div>
      
      {/* システム名 */}
      <span className="font-bold text-blue-700 hover:underline">
        Yamato Basic
      </span>
    </div>
  );
}
