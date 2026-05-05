import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  MessageSquare, 
  Star, 
  Filter, 
  Search,
  Eye,
  Download,
  Share2,
  Calendar,
  Image as ImageIcon,
  Video,
  ThumbsUp,
  Heart
} from 'lucide-react';

interface TestimonialManagerProps {
  subsidiary: any;
}

// Mock testimonial data
const mockTestimonials = [
  {
    id: 1,
    studentName: 'Sarah Johnson',
    course: 'Bioinformatics Bootcamp',
    rating: 5,
    text: 'This course completely transformed my understanding of bioinformatics. The hands-on approach and expert instructors made complex concepts easy to grasp.',
    type: 'text',
    date: '2024-06-15',
    featured: true
  },
  {
    id: 2,
    studentName: 'Michael Chen',
    course: 'AI Fundamentals Course',
    rating: 5,
    text: 'Outstanding course content and delivery. I now feel confident applying AI concepts in my research work.',
    type: 'video',
    date: '2024-06-14',
    featured: false
  },
  {
    id: 3,
    studentName: 'Emily Rodriguez',
    course: 'Bioinformatics Bootcamp',
    rating: 4,
    text: 'Great course with practical applications. The networking opportunities were invaluable.',
    type: 'image',
    date: '2024-06-13',
    featured: false
  },
  {
    id: 4,
    studentName: 'David Kim',
    course: 'AI Fundamentals Course',
    rating: 5,
    text: 'Exceeded my expectations! The curriculum is well-structured and the support from instructors is amazing.',
    type: 'text',
    date: '2024-06-12',
    featured: true
  }
];

export default function TestimonialManager({ subsidiary }: TestimonialManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filteredTestimonials = mockTestimonials.filter(testimonial => {
    const matchesSearch = testimonial.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testimonial.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || testimonial.rating.toString() === filterRating;
    const matchesType = filterType === 'all' || testimonial.type === filterType;
    
    return matchesSearch && matchesRating && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'image': return <ImageIcon className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const averageRating = mockTestimonials.reduce((sum, t) => sum + t.rating, 0) / mockTestimonials.length;

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Testimonials</p>
                <p className="text-2xl font-bold">{mockTestimonials.length}</p>
              </div>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card> */}

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                </div>
              </div>
              <Star className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Video Testimonials</p>
                <p className="text-2xl font-bold">{mockTestimonials.filter(t => t.type === 'video').length}</p>
              </div>
              <Video className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold">{mockTestimonials.filter(t => t.featured).length}</p>
              </div>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Testimonial Management
          </CardTitle>
          <CardDescription>
            View, manage, and moderate testimonials from your course participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Testimonials</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="pending">Pending Review</TabsTrigger>
              </TabsList>

              {/* Filters */}
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search testimonials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <select 
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                </select>
                
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="text">Text</option>
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                </select>
              </div>
            </div>

            <TabsContent value="all" className="space-y-4">
              {filteredTestimonials.map((testimonial) => (
                <Card key={testimonial.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {testimonial.studentName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{testimonial.studentName}</h4>
                          <p className="text-sm text-gray-600">{testimonial.course}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {testimonial.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                        )}
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getTypeIcon(testimonial.type)}
                          {testimonial.type}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">
                        {testimonial.rating}/5
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {testimonial.text}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(testimonial.date).toLocaleDateString()}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Feature
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="featured" className="space-y-4">
              {filteredTestimonials
                .filter(t => t.featured)
                .map((testimonial) => (
                  <Card key={testimonial.id} className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {testimonial.studentName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{testimonial.studentName}</h4>
                            <p className="text-sm text-gray-600">{testimonial.course}</p>
                          </div>
                        </div>
                        
                        <Badge className="bg-yellow-200 text-yellow-800">
                          <Heart className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>

                      <p className="text-gray-700 italic">
                        "{testimonial.text}"
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="pending">
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending testimonials to review</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}