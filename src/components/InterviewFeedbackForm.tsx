import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Star, Loader2 } from 'lucide-react';

interface InterviewFeedbackFormProps {
  interviewId: string;
  feedbackType: 'hr' | 'candidate';
  onSubmit?: () => void;
}

export const InterviewFeedbackForm = ({
  interviewId,
  feedbackType,
  onSubmit,
}: InterviewFeedbackFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [experienceRating, setExperienceRating] = useState(0);
  const [technicalRating, setTechnicalRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [overallImpression, setOverallImpression] = useState('');
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!rating || !feedbackText) {
      toast({
        title: 'Missing Fields',
        description: 'Please provide a rating and feedback',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('interview_feedback').insert({
        interview_id: interviewId,
        feedback_type: feedbackType,
        rating,
        experience_rating: experienceRating,
        technical_rating: technicalRating,
        communication_rating: communicationRating,
        feedback_text: feedbackText,
        overall_impression: overallImpression,
      });

      if (error) throw error;

      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback!',
      });

      onSubmit?.();
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (val: number) => void;
    label: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none transition-colors"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-6">
        {feedbackType === 'hr' ? 'HR Feedback' : 'Candidate Feedback'}
      </h3>

      <div className="space-y-6">
        <StarRating
          value={rating}
          onChange={setRating}
          label="Overall Rating *"
        />

        {feedbackType === 'hr' && (
          <>
            <StarRating
              value={technicalRating}
              onChange={setTechnicalRating}
              label="Technical Skills"
            />
            <StarRating
              value={communicationRating}
              onChange={setCommunicationRating}
              label="Communication"
            />
          </>
        )}

        {feedbackType === 'candidate' && (
          <StarRating
            value={experienceRating}
            onChange={setExperienceRating}
            label="Interview Experience"
          />
        )}

        <div className="space-y-2">
          <Label htmlFor="feedback">
            {feedbackType === 'hr'
              ? 'Detailed Feedback *'
              : 'Your Experience *'}
          </Label>
          <Textarea
            id="feedback"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder={
              feedbackType === 'hr'
                ? 'Provide detailed feedback about the candidate...'
                : 'Tell us about your interview experience...'
            }
            rows={5}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="impression">Overall Impression</Label>
          <Textarea
            id="impression"
            value={overallImpression}
            onChange={(e) => setOverallImpression(e.target.value)}
            placeholder="Any additional thoughts..."
            rows={3}
            className="resize-none"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Feedback'
          )}
        </Button>
      </div>
    </Card>
  );
};
