import React, { useEffect, useState } from 'react';
import { SocialPostService, SocialPost } from '@/services/SocialPostService';
import { Instagram, Twitter, Facebook, ExternalLink, MessageCircle, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export const SocialPostsSection = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    SocialPostService.getPosts(true).then((data) => {
      setPosts(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || posts.length === 0) return null;

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      default: return <Instagram className="w-5 h-5" />;
    }
  };

  return (
    <section className="bg-black py-20 md:py-32 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-4xl md:text-6xl font-black text-white mb-4">
              Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Vibes</span>
            </h2>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
              Join the movement. See how our community is thriving with our premium wellness solutions.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {posts.map((post, index) => (
            <motion.a
              key={post.id}
              href={post.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group block relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.3)]"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <img 
                  src={post.image_url} 
                  alt={post.caption || 'Community post'} 
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                
                {/* Platform Badge */}
                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md p-2.5 rounded-full border border-white/20 text-white shadow-lg">
                  {getPlatformIcon(post.platform || '')}
                </div>

                {/* Hover Overlay Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center gap-4 text-white mb-3">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Heart className="w-5 h-5 fill-current text-pink-500" /> 
                        <span>Like</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold">
                        <MessageCircle className="w-5 h-5" />
                        <span>Comment</span>
                      </div>
                    </div>
                    {post.caption && (
                      <p className="text-white/90 text-sm line-clamp-3 leading-relaxed">
                        {post.caption}
                      </p>
                    )}
                    <div className="mt-4 flex items-center text-cyan-400 font-bold text-sm uppercase tracking-wider group/link">
                      View Original Post <ExternalLink className="w-4 h-4 ml-2 transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};
