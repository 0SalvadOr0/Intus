import { motion } from "framer-motion";

const TestoAnimato = () => {
  const frasi = [
    "Scopri i progetti che abbiamo realizzato per la comunità.",
    "Ogni iniziativa nasce dall'ascolto delle esigenze del territorio",
    "e dalla partecipazione attiva dei cittadini."
  ];

  return (
    <div className="max-w-4xl mx-auto leading-relaxed text-xl md:text-2xl text-muted-foreground">
      {frasi.map((frase, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.6 }}
          className="mb-4"
        >
          {frase}
        </motion.p>
      ))}
    </div>
  );
};

export default TestoAnimato;
