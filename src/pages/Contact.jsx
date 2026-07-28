import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Report a Bug",
    message: ""
  });
  const [status, setStatus] = useState(""); // "sending", "success", "error"

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    
    const data = {
      access_key: "bb11e813-7383-4a9b-8bbb-0ffe32dffb8d",
      ...formData
    };

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "Report a Bug", message: "" });
        setTimeout(() => setStatus(""), 5000); // Clear success message after 5 seconds
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold mb-4 text-foreground">
          Get in Touch
        </h1>
        <p className="text-foreground/70 text-lg">
          Found a bug or have a suggestion? Feel free to reach out to me
          directly via email!
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 md:p-10 rounded-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-1.5">
                Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-white/40 dark:bg-slate-900/40 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all placeholder:text-foreground/40 text-foreground"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white/40 dark:bg-slate-900/40 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all placeholder:text-foreground/40 text-foreground"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground/80 mb-1.5">
              Subject
            </label>
            <select 
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full bg-white/40 dark:bg-slate-900/40 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all text-foreground appearance-none"
            >
              <option value="Report a Bug">Report a Bug</option>
              <option value="Suggest a Route">Suggest a Route</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground/80 mb-1.5">
              Message
            </label>
            <textarea
              rows={5}
              name="message"
              required
              value={formData.message}
              onChange={handleChange}
              className="w-full bg-white/40 dark:bg-slate-900/40 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all placeholder:text-foreground/40 text-foreground resize-none"
              placeholder="How can I help you?"
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            disabled={status === "sending"}
            className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === "sending" ? "Sending..." : "Send Message"}
          </button>
          
          {status === "success" && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 dark:text-green-400 font-semibold text-center mt-4">
              Message sent successfully! I'll get back to you soon.
            </motion.p>
          )}
          {status === "error" && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 font-semibold text-center mt-4">
              Failed to send message. Please try again.
            </motion.p>
          )}
        </form>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-full text-primary">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-foreground font-semibold">
                  ajaypalsinghrathorework@gmail.com
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-full text-primary">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-foreground/80 text-sm">
                  IIIT Bhubaneswar Campus, Gothapatna, Odisha, India
                </p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto p-5 bg-background/50 rounded-2xl border border-border/50 text-center flex flex-col items-center">
            <p className="text-sm font-semibold text-foreground/80 mb-3">
              Built with ❤️ by Ajaypal Singh Rathore
            </p>
            <a
              href="https://www.linkedin.com/in/ajaypal-singh-rathore-67614a28b/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#0077b5] text-white hover:scale-110 transition-transform shadow-md"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;
