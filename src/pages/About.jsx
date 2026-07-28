import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-12"
      >
        <h1 className="text-4xl font-extrabold mb-6 text-gradient">
          About RailSetu
        </h1>
        <div className="space-y-6 text-foreground/80 leading-relaxed text-lg">
          <p>
            RailSetu is a next-generation railway route finder designed
            specifically for India's vast and complex rail network. Our mission
            is to make train travel planning seamless, beautiful, and
            intelligent.
          </p>
          <p>
            By leveraging advanced routing algorithms, we provide you with the
            smartest connections, predicting delays and analyzing historical
            data to give you a{" "}
            <strong className="text-primary">Reliability Score</strong> for
            every transfer.
          </p>
          <p>
            Say goodbye to clunky interfaces and uncertain transfers. Welcome to
            the future of rail travel.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
