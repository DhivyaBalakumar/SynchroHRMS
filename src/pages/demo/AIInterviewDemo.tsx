import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  MessageSquare, 
  Brain, 
  CheckCircle2, 
  Clock,
  User,
  Briefcase,
  Play,
  FileText,
  TrendingUp,
  Shield
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const AIInterviewDemo = () => {
  const [currentStep, setCurrentStep] = useState<'overview' | 'candidate' | 'interview' | 'analysis' | 'decision'>('overview');
  
  const demoInterview = {
    candidate: {
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      position: "Senior Software Engineer",
      experience: "5 years",
      resume: "Full-stack developer with expertise in React, Node.js, and cloud platforms"
    },
    interview: {
      duration: "24:35",
      questions: 5,
      completed: true,
      transcript: [
        {
          speaker: "AI",
          time: "00:00",
          text: "Hello Sarah! Welcome to your interview for the Senior Software Engineer position. I'm your AI interviewer today. Let's start by having you tell me about yourself and your background in software development."
        },
        {
          speaker: "Candidate",
          time: "00:15",
          text: "Thank you! I'm Sarah, and I've been working as a software engineer for the past 5 years. I started my career building full-stack applications using React and Node.js, and I've grown to lead several key projects involving microservices architecture and cloud deployment on AWS."
        },
        {
          speaker: "AI",
          time: "00:45",
          text: "That's impressive experience. Can you tell me about a particularly challenging project you've worked on? What was the problem, and how did you solve it?"
        },
        {
          speaker: "Candidate",
          time: "01:05",
          text: "One of the most challenging projects was migrating our monolithic application to a microservices architecture. We had performance issues and scaling problems. I led the effort to break down the monolith into 12 independent services, implemented API gateways, and set up CI/CD pipelines. This improved our response times by 60% and made deployments much more reliable."
        },
        {
          speaker: "AI",
          time: "02:15",
          text: "Excellent problem-solving approach. How do you stay current with rapidly changing technology trends, especially in areas like cloud computing and DevOps?"
        },
        {
          speaker: "Candidate",
          time: "02:30",
          text: "I'm very passionate about continuous learning. I regularly contribute to open-source projects, attend tech conferences, and I'm currently pursuing AWS certifications. I also run a weekly knowledge-sharing session with my team where we discuss new technologies and best practices."
        }
      ]
    },
    analysis: {
      overallScore: 87,
      technicalScore: 92,
      communicationScore: 85,
      problemSolvingScore: 88,
      culturalFitScore: 84,
      confidenceScore: 86,
      strengths: [
        "Strong technical expertise in full-stack development",
        "Demonstrated leadership in complex projects",
        "Excellent problem-solving abilities",
        "Clear and articulate communication",
        "Proactive about continuous learning"
      ],
      concerns: [
        "Could provide more specific metrics in answers",
        "Would benefit from discussing team collaboration more"
      ],
      summary: "Sarah is a highly qualified candidate with strong technical skills and proven leadership experience. Her experience with microservices architecture and cloud platforms aligns perfectly with our needs. She demonstrates excellent problem-solving abilities and a growth mindset. Recommended for next round.",
      sentiment: {
        overall: "positive",
        confidence: "high",
        engagement: "very engaged",
        emotions: ["confident", "enthusiastic", "professional"]
      }
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-primary/5 to-purple-500/5">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Video className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">AI Interview Platform Demo</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the complete AI-powered interview process from candidate login to HR decision-making
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="p-6 cursor-pointer hover:shadow-lg transition-all hover:border-primary"
          onClick={() => setCurrentStep('candidate')}
        >
          <User className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-bold mb-2">1. Candidate Experience</h3>
          <p className="text-sm text-muted-foreground">Secure login, interview prep, and platform walkthrough</p>
          <Button variant="ghost" className="mt-4 w-full">
            Explore <Play className="ml-2 h-4 w-4" />
          </Button>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:shadow-lg transition-all hover:border-primary"
          onClick={() => setCurrentStep('interview')}
        >
          <Video className="h-8 w-8 text-blue-500 mb-3" />
          <h3 className="font-bold mb-2">2. Live AI Interview</h3>
          <p className="text-sm text-muted-foreground">Real-time voice/video interview with AI interviewer</p>
          <Button variant="ghost" className="mt-4 w-full">
            Explore <Play className="ml-2 h-4 w-4" />
          </Button>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:shadow-lg transition-all hover:border-primary"
          onClick={() => setCurrentStep('analysis')}
        >
          <Brain className="h-8 w-8 text-purple-500 mb-3" />
          <h3 className="font-bold mb-2">3. AI Analysis</h3>
          <p className="text-sm text-muted-foreground">Automated scoring, sentiment analysis, and insights</p>
          <Button variant="ghost" className="mt-4 w-full">
            Explore <Play className="ml-2 h-4 w-4" />
          </Button>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:shadow-lg transition-all hover:border-primary"
          onClick={() => setCurrentStep('decision')}
        >
          <CheckCircle2 className="h-8 w-8 text-green-500 mb-3" />
          <h3 className="font-bold mb-2">4. HR Decision</h3>
          <p className="text-sm text-muted-foreground">Review results, make decisions, and take action</p>
          <Button variant="ghost" className="mt-4 w-full">
            Explore <Play className="ml-2 h-4 w-4" />
          </Button>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Secure & Private</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Token-based authentication, encrypted connections, and GDPR-compliant data handling
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">AI-Powered Analysis</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Advanced NLP for sentiment analysis, automatic scoring, and objective insights
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Data-Driven Decisions</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Comprehensive analytics, comparison tools, and actionable recommendations
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderCandidate = () => (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setCurrentStep('overview')}>
        ← Back to Overview
      </Button>

      <Card className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Candidate Experience</h2>
            <p className="text-muted-foreground">How candidates interact with the platform</p>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">1. Login</TabsTrigger>
            <TabsTrigger value="prep">2. Preparation</TabsTrigger>
            <TabsTrigger value="setup">3. Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <Card className="p-6 bg-secondary/20">
              <h3 className="font-bold mb-3">Secure Token-Based Access</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Candidate receives unique interview link via email</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Token validates identity and resume association</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Time-limited access for security</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Single-use token prevents multiple submissions</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-3">Sample Candidate Info</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {demoInterview.candidate.name}</p>
                <p><strong>Email:</strong> {demoInterview.candidate.email}</p>
                <p><strong>Position:</strong> {demoInterview.candidate.position}</p>
                <p><strong>Status:</strong> <Badge variant="outline">Token Valid</Badge></p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="prep" className="space-y-4">
            <Card className="p-6 bg-secondary/20">
              <h3 className="font-bold mb-3">Interview Preparation Guide</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Find a quiet space</p>
                    <p className="text-muted-foreground">Choose a well-lit, distraction-free environment</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Check your equipment</p>
                    <p className="text-muted-foreground">Test camera, microphone, and internet connection</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Review your resume</p>
                    <p className="text-muted-foreground">Be ready to discuss your experience in detail</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold">4</span>
                  </div>
                  <div>
                    <p className="font-medium">Allocate sufficient time</p>
                    <p className="text-muted-foreground">Typical interview: 20-30 minutes</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="setup" className="space-y-4">
            <Card className="p-6 bg-secondary/20">
              <h3 className="font-bold mb-3">Camera & Microphone Setup</h3>
              <div className="aspect-video bg-black/10 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center">
                  <Video className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Camera preview would appear here</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Browser requests camera/microphone permissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Candidate can test video and audio quality</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Platform provides feedback on setup quality</span>
                </li>
              </ul>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => setCurrentStep('interview')}>
            Continue to Interview <Play className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderInterview = () => (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setCurrentStep('overview')}>
        ← Back to Overview
      </Button>

      <Card className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
            <Video className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Live AI Interview</h2>
            <p className="text-muted-foreground">Real-time conversation with AI interviewer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Interview Progress</h3>
              <Badge>Question 3 of 5</Badge>
            </div>
            <Progress value={60} className="mb-2" />
            <p className="text-xs text-muted-foreground">Duration: {demoInterview.interview.duration}</p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Interview Metrics</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Questions</p>
                <p className="font-bold">{demoInterview.interview.questions}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-bold">AI Video</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-secondary/20">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="font-bold">Live Transcript</h3>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {demoInterview.interview.transcript.map((item, idx) => (
              <div key={idx} className={`flex ${item.speaker === 'AI' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-lg p-4 ${
                  item.speaker === 'AI' 
                    ? 'bg-primary/10' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {item.speaker}
                    </Badge>
                    <span className="text-xs opacity-70">{item.time}</span>
                  </div>
                  <p className="text-sm">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h4 className="font-semibold mb-2 text-sm">AI Features</h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>✓ Natural conversation flow</li>
              <li>✓ Context-aware follow-ups</li>
              <li>✓ Real-time transcription</li>
            </ul>
          </Card>
          <Card className="p-4">
            <h4 className="font-semibold mb-2 text-sm">Recording</h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>✓ Video & audio capture</li>
              <li>✓ Secure cloud storage</li>
              <li>✓ Playback for HR review</li>
            </ul>
          </Card>
          <Card className="p-4">
            <h4 className="font-semibold mb-2 text-sm">Analysis</h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>✓ Real-time sentiment tracking</li>
              <li>✓ Response quality scoring</li>
              <li>✓ Engagement metrics</li>
            </ul>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => setCurrentStep('analysis')}>
            View AI Analysis <Play className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderAnalysis = () => (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setCurrentStep('overview')}>
        ← Back to Overview
      </Button>

      <Card className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center">
            <Brain className="h-8 w-8 text-purple-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">AI Analysis Results</h2>
            <p className="text-muted-foreground">Comprehensive automated evaluation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">
                {demoInterview.analysis.overallScore}
              </div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
            </div>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Technical Skills</p>
            <div className="flex items-center gap-2">
              <Progress value={demoInterview.analysis.technicalScore} className="flex-1" />
              <span className="text-sm font-bold">{demoInterview.analysis.technicalScore}</span>
            </div>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Communication</p>
            <div className="flex items-center gap-2">
              <Progress value={demoInterview.analysis.communicationScore} className="flex-1" />
              <span className="text-sm font-bold">{demoInterview.analysis.communicationScore}</span>
            </div>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Problem Solving</p>
            <div className="flex items-center gap-2">
              <Progress value={demoInterview.analysis.problemSolvingScore} className="flex-1" />
              <span className="text-sm font-bold">{demoInterview.analysis.problemSolvingScore}</span>
            </div>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Cultural Fit</p>
            <div className="flex items-center gap-2">
              <Progress value={demoInterview.analysis.culturalFitScore} className="flex-1" />
              <span className="text-sm font-bold">{demoInterview.analysis.culturalFitScore}</span>
            </div>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Confidence</p>
            <div className="flex items-center gap-2">
              <Progress value={demoInterview.analysis.confidenceScore} className="flex-1" />
              <span className="text-sm font-bold">{demoInterview.analysis.confidenceScore}</span>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6 bg-green-500/5 border-green-500/20">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Key Strengths
            </h3>
            <ul className="space-y-2">
              {demoInterview.analysis.strengths.map((strength, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 bg-yellow-500/5 border-yellow-500/20">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Areas for Growth
            </h3>
            <ul className="space-y-2">
              {demoInterview.analysis.concerns.map((concern, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">•</span>
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="p-6 bg-secondary/20">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            AI Summary
          </h3>
          <p className="text-sm leading-relaxed">{demoInterview.analysis.summary}</p>
        </Card>

        <Card className="p-6 mt-6">
          <h3 className="font-bold mb-3">Sentiment Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Overall Sentiment</p>
              <Badge variant="outline" className="capitalize">
                {demoInterview.analysis.sentiment.overall}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Confidence Level</p>
              <Badge variant="outline" className="capitalize">
                {demoInterview.analysis.sentiment.confidence}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Engagement</p>
              <Badge variant="outline" className="capitalize">
                {demoInterview.analysis.sentiment.engagement}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Key Emotions</p>
              <div className="flex gap-1 flex-wrap">
                {demoInterview.analysis.sentiment.emotions.map((emotion, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {emotion}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => setCurrentStep('decision')}>
            View HR Decision Panel <Play className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderDecision = () => (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setCurrentStep('overview')}>
        ← Back to Overview
      </Button>

      <Card className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">HR Decision Panel</h2>
            <p className="text-muted-foreground">Review and take action on interview results</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 lg:col-span-2">
            <h3 className="font-bold mb-4">Candidate Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm text-muted-foreground">Candidate</span>
                <span className="font-medium">{demoInterview.candidate.name}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm text-muted-foreground">Position</span>
                <span className="font-medium">{demoInterview.candidate.position}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm text-muted-foreground">Experience</span>
                <span className="font-medium">{demoInterview.candidate.experience}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm text-muted-foreground">AI Score</span>
                <Badge className="bg-green-500">{demoInterview.analysis.overallScore}/100</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Recommendation</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500">
                  Recommended for Next Round
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full bg-green-500 hover:bg-green-600">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Proceed to Next Round
              </Button>
              <Button variant="outline" className="w-full">
                <Video className="mr-2 h-4 w-4" />
                Watch Full Interview
              </Button>
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                View Resume
              </Button>
              <Button variant="outline" className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Read Transcript
              </Button>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-primary/5">
          <h3 className="font-bold mb-4">AI Recommendation Rationale</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Why We Recommend This Candidate:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Exceptional technical score (92/100) demonstrates strong expertise in required skills</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Proven track record with complex projects including microservices migration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Strong cultural fit with emphasis on continuous learning and knowledge sharing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Excellent communication skills evident throughout the interview</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2">Suggested Next Steps:</h4>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">1.</span>
                  <span>Schedule technical assessment with senior engineering team</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">2.</span>
                  <span>Arrange culture fit interview with team members</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">3.</span>
                  <span>Prepare coding challenge focused on microservices architecture</span>
                </li>
              </ol>
            </div>
          </div>
        </Card>

        <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            💡 This demo showcases the complete AI interview platform workflow. In production, HR can review multiple candidates, compare scores, and make informed hiring decisions efficiently.
          </p>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {currentStep === 'overview' && renderOverview()}
        {currentStep === 'candidate' && renderCandidate()}
        {currentStep === 'interview' && renderInterview()}
        {currentStep === 'analysis' && renderAnalysis()}
        {currentStep === 'decision' && renderDecision()}
      </div>
    </div>
  );
};

export default AIInterviewDemo;
