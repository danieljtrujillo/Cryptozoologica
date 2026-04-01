import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image as ImageIcon, Loader2, Sparkles, Wand2, Trash2, Search } from 'lucide-react';
import { createCryptidChat, generateCryptidSketch, identifyCryptid } from '../services/gemini';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

export default function ResearchLab() {
  const [activeMode, setActiveMode] = useState<'chat' | 'sketch' | 'analyze'>('chat');
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sketch state
  const [sketchPrompt, setSketchPrompt] = useState('');
  const [sketchUrl, setSketchUrl] = useState<string | null>(null);

  // Analysis state
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!chatRef.current) {
      chatRef.current = createCryptidChat();
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userMessage });
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, my field radio is acting up. Could you repeat that?" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSketch = async () => {
    if (!sketchPrompt.trim() || loading) return;
    setLoading(true);
    try {
      const url = await generateCryptidSketch(sketchPrompt);
      setSketchUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage || loading) return;
    setLoading(true);
    try {
      const result = await identifyCryptid(selectedImage);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <h2 className="text-4xl ink-text">Research Lab</h2>
        <p className="font-serif italic opacity-70">Advanced tools for identification and visualization.</p>
      </header>

      <div className="flex justify-center space-x-4 mb-8">
        {[
          { id: 'chat', label: 'Consult Dr. Thorne', icon: Mic },
          { id: 'sketch', label: 'Field Sketcher', icon: Wand2 },
          { id: 'analyze', label: 'Specimen Analysis', icon: ImageIcon },
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id as any)}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 border border-[#5a2a27] font-serif italic transition-all duration-300",
              activeMode === mode.id ? "bg-[#5a2a27] text-[#f5f2ed]" : "text-[#5a2a27] hover:bg-[#5a2a27]/10"
            )}
          >
            <mode.icon size={18} />
            <span>{mode.label}</span>
          </button>
        ))}
      </div>

      <div className="journal-card min-h-[500px] flex flex-col">
        {activeMode === 'chat' && (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 scrollbar-thin scrollbar-thumb-[#5a2a27]/20">
              {messages.length === 0 && (
                <div className="text-center py-20 opacity-40 italic font-serif">
                  <p>"Dr. Thorne here. What have you discovered in the field?"</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-sm font-serif text-lg",
                    msg.role === 'user' ? "bg-[#5a2a27]/10 text-[#5a2a27] italic" : "bg-[#fdfcf0] border border-[#d4c5b9] ink-text"
                  )}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="p-4 rounded-sm bg-[#fdfcf0] border border-[#d4c5b9] ink-text">
                    <Loader2 className="animate-spin" />
                  </div>
                </div>
              )}
            </div>
            <form onSubmit={handleSendMessage} className="flex space-x-2 p-2 border-t border-[#d4c5b9]">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Dr. Thorne about a cryptid..."
                className="flex-1 bg-transparent p-3 focus:outline-none font-serif italic text-lg"
              />
              <button type="submit" disabled={loading} className="p-3 text-[#5a2a27] hover:bg-[#5a2a27]/10 rounded-full">
                <Send size={24} />
              </button>
            </form>
          </>
        )}

        {activeMode === 'sketch' && (
          <div className="space-y-6 p-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest opacity-50">Cryptid Description</label>
              <textarea
                value={sketchPrompt}
                onChange={(e) => setSketchPrompt(e.target.value)}
                placeholder="Describe the creature in detail (e.g. A large bipedal lizard with glowing red eyes and leathery wings)..."
                className="w-full bg-transparent border-b border-[#5a2a27] p-2 focus:outline-none font-serif italic text-lg min-h-[100px] resize-none"
              />
            </div>
            <button
              onClick={handleGenerateSketch}
              disabled={loading || !sketchPrompt.trim()}
              className="btn-journal w-full flex items-center justify-center space-x-2 py-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
              <span>Generate Field Sketch</span>
            </button>

            {sketchUrl && (
              <div className="mt-8 relative group">
                <img src={sketchUrl} alt="Cryptid Sketch" className="w-full rounded-sm border border-[#d4c5b9] shadow-inner" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                <p className="mt-4 text-center font-serif italic text-xs opacity-50">FIG. {Math.floor(Math.random() * 100)}: ARTIST'S RENDERING BASED ON FIELD DATA</p>
              </div>
            )}
          </div>
        )}

        {activeMode === 'analyze' && (
          <div className="space-y-6 p-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#d4c5b9] rounded-sm p-12 hover:bg-[#5a2a27]/5 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {selectedImage ? (
                <img src={selectedImage} alt="Selected" className="max-h-[300px] rounded-sm shadow-md" />
              ) : (
                <div className="text-center space-y-2 opacity-40">
                  <ImageIcon size={48} className="mx-auto" />
                  <p className="font-serif italic">Upload a photo or specimen image for analysis</p>
                </div>
              )}
            </div>

            {selectedImage && (
              <div className="flex space-x-2">
                <button
                  onClick={handleAnalyzeImage}
                  disabled={loading}
                  className="btn-journal flex-1 flex items-center justify-center space-x-2 py-4"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                  <span>Identify Specimen</span>
                </button>
                <button
                  onClick={() => { setSelectedImage(null); setAnalysisResult(null); }}
                  className="p-4 border border-[#8b0000] text-[#8b0000] hover:bg-[#8b0000]/10"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            )}

            {analysisResult && (
              <div className="mt-8 p-6 bg-[#5a2a27]/5 border-l-4 border-[#5a2a27] font-serif">
                <span className="text-xs uppercase tracking-widest opacity-50 mb-2 block">Analysis Report</span>
                <div className="prose prose-sepia max-w-none text-lg">
                  <ReactMarkdown>{analysisResult}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
