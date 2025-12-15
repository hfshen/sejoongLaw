"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, Youtube } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { cn } from "@/lib/utils"

interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  videoUrl: string
  duration: string
  category: string
}

const videos: Video[] = [
  {
    id: "1",
    title: "법무법인 세중 소개",
    description: "법무법인 세중의 전문성과 서비스를 소개합니다.",
    thumbnail: "/video-thumbnail-1.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example1",
    duration: "3:24",
    category: "소개",
  },
  {
    id: "2",
    title: "부동산 분쟁 해결 사례",
    description: "성공적인 부동산 분쟁 해결 사례를 소개합니다.",
    thumbnail: "/video-thumbnail-2.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example2",
    duration: "5:12",
    category: "사례",
  },
  {
    id: "3",
    title: "이혼 소송 절차 안내",
    description: "이혼 소송의 전반적인 절차를 안내합니다.",
    thumbnail: "/video-thumbnail-3.jpg",
    videoUrl: "https://www.youtube.com/watch?v=example3",
    duration: "4:38",
    category: "안내",
  },
]

export default function VideoSection() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  return (
    <section className="section-padding bg-background">
      <div className="container-max">
        <div className="text-center mb-12">
          <h2 className="section-title">비디오 콘텐츠</h2>
          <p className="body-text max-w-2xl mx-auto">
            법무법인 세중의 전문성과 서비스를 비디오로 만나보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card hover>
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-gray-200 rounded-t-lg overflow-hidden group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedVideo(video)}
                        className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-lg"
                      >
                        <Play className="w-8 h-8 ml-1" />
                      </motion.button>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">
                        {video.duration}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {video.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-secondary mb-2">
                      {video.title}
                    </h3>
                    <p className="body-text text-sm">{video.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Video Modal */}
        {selectedVideo && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-4xl w-full bg-white rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video bg-gray-900">
                <iframe
                  src={selectedVideo.videoUrl.replace(
                    "watch?v=",
                    "embed/"
                  )}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2">{selectedVideo.title}</h3>
                <p className="body-text">{selectedVideo.description}</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  )
}

