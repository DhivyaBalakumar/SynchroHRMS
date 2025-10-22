import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface RoleCardProps {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  image: string;
  features: string[];
  isSelected: boolean;
  onClick: () => void;
  delay?: number;
}

export const RoleCard = ({
  id,
  title,
  description,
  Icon,
  image,
  features,
  isSelected,
  onClick,
  delay = 0,
}: RoleCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    onClick();
    navigate(`/auth?mode=login&role=${id}`);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/auth?mode=login&role=${id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="relative group"
    >
      <Card
        onClick={handleCardClick}
        className={`
          relative overflow-hidden cursor-pointer transition-all duration-300
          ${isSelected ? 'ring-4 ring-primary shadow-2xl scale-105' : 'hover:shadow-xl'}
          bg-card backdrop-blur-sm border-2
          ${isSelected ? 'border-primary' : 'border-border hover:border-primary/50'}
          h-full flex flex-col
        `}
      >
        {/* Image Section - Larger */}
        <div className="relative h-52 sm:h-60 md:h-64 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
          
          {/* Title with Icon Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/90 backdrop-blur-sm">
                <Icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground drop-shadow-lg">{title}</h3>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col">
          {/* Description */}
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {description}
          </p>
          
          {/* Key Access Features */}
          <div className="space-y-3 flex-1">
            <p className="text-sm font-bold text-foreground tracking-wide">Key Access:</p>
            <ul className="space-y-2.5">
              {features.map((feature, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2.5">
                  <span className="text-primary font-bold mt-0.5 text-base">•</span>
                  <span className="leading-snug">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleButtonClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl text-base font-semibold py-6 rounded-lg mt-4"
            size="lg"
          >
            Select {title} Login
          </Button>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <motion.div
            layoutId="selected-indicator"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};
