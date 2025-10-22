import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, X, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface FeatureCardProps {
  title: string;
  description: string;
  Icon: LucideIcon;
  image: string;
  usageSteps: string[];
  requiredRoles: string[];
  dashboardRoute: string | null;
  delay?: number;
}

export const FeatureCard = ({
  title,
  description,
  Icon,
  image,
  usageSteps,
  requiredRoles,
  dashboardRoute,
  delay = 0,
}: FeatureCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      employee: "Employees",
      manager: "Managers",
      senior_manager: "Senior Managers",
      hr: "HR",
      intern: "Interns",
    };
    return roleMap[role] || role;
  };

  const handleLearnMore = () => {
    if (!user) {
      // Not logged in, show modal
      setIsModalOpen(true);
    } else if (userRole && requiredRoles.includes(userRole)) {
      // User has access, navigate to dashboard
      if (dashboardRoute) {
        navigate(dashboardRoute);
      } else {
        // Feature available everywhere (like AI Career Coach)
        setIsModalOpen(true);
      }
    } else {
      // User doesn't have access
      setIsModalOpen(true);
    }
  };

  const hasAccess = user && userRole && requiredRoles.includes(userRole);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ delay, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden card-lift bg-card border-border hover:border-primary/50 transition-all duration-300">
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary" />
          
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <motion.div
                className="p-3 rounded-xl bg-primary/10 text-primary"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Icon className="h-6 w-6" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {requiredRoles.map((role) => (
                <Badge key={role} variant="secondary" className="text-xs">
                  {getRoleDisplayName(role)}
                </Badge>
              ))}
            </div>

            <Button
              onClick={handleLearnMore}
              variant="outline"
              className="w-full group hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {hasAccess && dashboardRoute ? "Go to Feature" : "Learn More"}
              <motion.span
                className="inline-block ml-2"
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
              >
                →
              </motion.span>
            </Button>
          </div>
        </Card>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  {title}
                </DialogTitle>
              </DialogHeader>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Feature Image */}
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                </div>

                {/* Description */}
                <div>
                  <p className="text-muted-foreground text-lg">{description}</p>
                </div>

                {/* How to Use */}
                <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                  <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="text-primary">📋</span>
                    How to Use This Feature
                  </h4>
                  <ol className="space-y-3">
                    {usageSteps.map((step, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex gap-3"
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </motion.li>
                    ))}
                  </ol>
                </div>

                {/* Access Information */}
                <div className={`border-l-4 rounded-r-lg p-4 ${
                  hasAccess 
                    ? "bg-accent/10 border-accent" 
                    : "bg-muted border-muted-foreground"
                }`}>
                  {hasAccess ? (
                    <>
                      <p className="text-sm text-foreground mb-2">
                        <span className="font-semibold">✅ You have access to this feature</span>
                      </p>
                      {dashboardRoute && (
                        <Button 
                          onClick={() => {
                            setIsModalOpen(false);
                            navigate(dashboardRoute);
                          }}
                          className="w-full"
                        >
                          Go to {title}
                        </Button>
                      )}
                    </>
                  ) : user ? (
                    <div className="flex items-start gap-3">
                      <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-foreground font-semibold mb-1">
                          Access Required
                        </p>
                        <p className="text-sm text-muted-foreground">
                          This feature is only accessible to: {requiredRoles.map(getRoleDisplayName).join(", ")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-foreground mb-2">
                        <span className="font-semibold">🔐 Sign in required</span>
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        This feature is accessible to: {requiredRoles.map(getRoleDisplayName).join(", ")}
                      </p>
                      <Button 
                        onClick={() => {
                          setIsModalOpen(false);
                          navigate('/auth?mode=login');
                        }}
                        className="w-full"
                      >
                        Sign In to Access
                      </Button>
                    </div>
                  )}
                </div>

                {/* Interactive Demo Note */}
                <div className="bg-accent/10 border-l-4 border-accent rounded-r-lg p-4">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">💡 Pro Tip:</span> This feature includes interactive tooltips, 
                    real-time updates, and contextual help throughout the interface.
                  </p>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};
