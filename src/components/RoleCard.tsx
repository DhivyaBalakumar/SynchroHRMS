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
      className="relative"
    >
      <Card
        onClick={handleCardClick}
        className={`
          relative overflow-hidden cursor-pointer transition-all duration-300
          ${isSelected ? 'ring-4 ring-primary shadow-xl' : 'hover:shadow-lg'}
          bg-card backdrop-blur-sm border-2
          ${isSelected ? 'border-primary' : 'border-border hover:border-primary/50'}
        `}
        style={{ boxShadow: isSelected ? 'var(--shadow-card-hover)' : 'var(--shadow-card)' }}
      >
        {/* Gradient overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 transition-opacity"
          whileHover={{ opacity: 1 }}
        />
        
        {/* Image */}
        <div className="relative h-40 sm:h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
            <div className="flex items-center gap-2 text-primary">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              <h3 className="text-lg sm:text-xl font-bold text-foreground">{title}</h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
          
          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-semibold text-foreground">Key Access:</p>
            <ul className="space-y-1">
              {features.map((feature, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5 sm:mt-1">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            onClick={handleButtonClick}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base py-2 sm:py-2.5"
          >
            Select {title} Login
          </Button>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <motion.div
            layoutId="selected-indicator"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};
