import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  MessageSquare, 
  Camera, 
  Video, 
  Upload,
  CheckCircle,
  Star,
  Heart,
  ThumbsUp
} from 'lucide-react';
import { toast } from 'sonner';

interface TestimonialFormProps {
  course: any;
  subsidiary: any;
  studentName: string;
}

export default function TestimonialForm({ course, subsidiary, studentName }: TestimonialFormProps) {
  const [testimonialText, setTestimonialText] = useState('');
  const [rating, setRating] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      toast.success('Image uploaded successfully');
    } else {
      toast.error('Please upload a valid image file');
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error('Video file is too large. Please upload a file smaller than 50MB');
        return;
      }
      setUploadedVideo(file);
      toast.success('Video uploaded successfully');
    } else {
      toast.error('Please upload a valid video file');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testimonialText.trim() && !uploadedImage && !uploadedVideo) {
      toast.error('Please provide at least a text testimonial, image, or video');
      return;
    }

    // Simulate submission
    setTimeout(() => {
      setSubmitted(true);
      toast.success('Thank you for your testimonial! It has been submitted successfully.');
    }, 1000);
  };

  if (submitted) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            Testimonial Submitted Successfully!
          </h3>
          <p className="text-green-700 mb-4">
            Thank you for sharing your experience with us. Your feedback helps us improve our courses.
          </p>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Testimonial #{Date.now().toString().slice(-6)}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Share Your Experience
        </CardTitle>
        <CardDescription>
          Help others by sharing your experience with the {course.name}. Your testimonial will help future learners.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label>How would you rate this course?</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 rounded transition-colors ${
                    star <= rating
                      ? 'text-yellow-500 hover:text-yellow-600'
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600">
                You rated this course {rating} out of 5 stars
              </p>
            )}
          </div>

          {/* Text Testimonial */}
          <div className="space-y-2">
            <Label htmlFor="testimonial">Written Testimonial</Label>
            <Textarea
              id="testimonial"
              placeholder="Share your thoughts about the course... What did you learn? How has it helped you? Would you recommend it to others?"
              value={testimonialText}
              onChange={(e) => setTestimonialText(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-sm text-gray-500">
              {testimonialText.length}/500 characters
            </p>
          </div>

          {/* Media Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div className="space-y-3">
              <Label>Upload a Photo (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    Click to upload an image
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG up to 10MB
                  </p>
                </label>
              </div>
              {uploadedImage && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                  <CheckCircle className="w-4 h-4" />
                  {uploadedImage.name}
                </div>
              )}
            </div>

            {/* Video Upload */}
            <div className="space-y-3">
              <Label>Upload a Video (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    Click to upload a video
                  </p>
                  <p className="text-xs text-gray-500">
                    MP4, MOV up to 50MB
                  </p>
                </label>
              </div>
              {uploadedVideo && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                  <CheckCircle className="w-4 h-4" />
                  {uploadedVideo.name}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" size="lg" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Submit Testimonial
            </Button>
          </div>

          {/* Encouragement Message */}
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <ThumbsUp className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-indigo-800 mb-1">Why share a testimonial?</p>
                <ul className="text-indigo-700 space-y-1">
                  <li>• Help future learners make informed decisions</li>
                  <li>• Celebrate your achievement and inspire others</li>
                  <li>• Provide valuable feedback to improve our courses</li>
                  <li>• Build your professional network and online presence</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}