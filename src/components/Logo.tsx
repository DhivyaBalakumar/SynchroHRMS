import { motion } from "framer-motion";
import logoImage from "@/assets/logo.png";

export const Logo = () => {
  return (
    <motion.div
      className="flex items-center gap-3 group cursor-pointer"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <motion.img
        src={logoImage}
        alt="SynchroHR Logo"
        className="h-12 w-12"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          SynchroHR
        </h1>
        <p className="text-xs text-muted-foreground">Intelligent HR Platform</p>
      </div>
    </motion.div>
  );
};
