import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { analyzeText } from "@/services/analyze";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { ChevronRight, ChevronDown } from "lucide-react";

type SubTrait = {
  present: boolean;
  score: number;
  evidence: string | null;
  analysis: string;
};

type TraitData = {
  [subTrait: string]: SubTrait;
};

type AnalysisResult = {
  [trait: string]: TraitData;
};

const models = {
  "mistral.mixtral-8x7b-instruct-v0:1":
    "Mixtral 8x7B - Fast and capable instruction-following model",
  "meta.llama3-70b-instruct-v1:0":
    "LLaMA 3 70B - Advanced reasoning and nuanced personality insight",
};

export default function PersonalityAnalyzer() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userInput, setUserInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(
    "mistral.mixtral-8x7b-instruct-v0:1"
  );
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedTraits, setExpandedTraits] = useState<Set<string>>(new Set());

  const handleAnalyze = async () => {
    if (!systemPrompt.trim() || !userInput.trim()) {
      return;
    }
    if (!selectedModel) {
      toast("Missing Information", {
        description: "Please select a model.",
      });
      return;
    }

    if (selectedModel === "meta.llama3-70b-instruct-v1:0") {
      toast("Advanced Model Selected", {
        description:
          "You've selected LLaMA 3 70B — results may be more nuanced and detailed.",
      });
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const raw = await analyzeText(userInput, systemPrompt, selectedModel);
      const parsedResult = JSON.parse(raw);
      setAnalysis(parsedResult);
      toast("Analysis Complete", {
        description: "Your personality analysis is ready!",
      });
    } catch (error) {
      console.error(error);
      toast("Analysis Failed", {
        description: "Please try again with different text or model.",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTrait = (traitKey: string) => {
    const newExpanded = new Set(expandedTraits);
    if (newExpanded.has(traitKey)) {
      newExpanded.delete(traitKey);
    } else {
      newExpanded.add(traitKey);
    }
    setExpandedTraits(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "bg-stone-100 text-stone-600 border-stone-200";
    if (score >= 0.6) return "bg-slate-100 text-slate-600 border-slate-200";
    if (score >= 0.4)
      return "bg-neutral-100 text-neutral-600 border-neutral-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-stone-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-light text-stone-200 tracking-wide">
              Personality Analyzer
            </h1>
            <p className="text-lg text-stone-400 max-w-3xl mx-auto leading-relaxed">
              Discover insights about personality through thoughtful text
              analysis
            </p>
          </div>

          {/* Input Section - Stacked */}
          <div className="space-y-6">
            {/* System Prompt */}
            <Card
              style={{ backgroundColor: "rgba(48, 48, 48, 0.8)" }}
              className="border-none shadow-sm"
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-white">
                  System Prompt
                </CardTitle>
                <p className="text-sm text-white">
                  Define how the AI should analyze personality traits
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="You are an expert personality analyst. Analyze the following text for personality traits, focusing on the Big Five model. Provide detailed insights with evidence from the text..."
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="min-h-36 border border-stone-600 focus:border-stone-500 focus:ring-stone-500/20 resize-none text-base leading-relaxed bg-stone-700/40 text-stone-200 placeholder:text-stone-500"
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-white/50">
                    {systemPrompt.length} characters
                  </span>
                  <span className="text-xs text-white/50">
                    System Instructions
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* User Input */}
            <Card
              style={{ backgroundColor: "rgba(48, 48, 48, 0.8)" }}
              className="border-none shadow-sm"
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-white">
                  User Input
                </CardTitle>
                <p className="text-sm text-white">
                  Share your thoughts, experiences, or any text to analyze
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="I've been reflecting on my career path lately. I find myself drawn to creative projects and collaborative environments. When facing challenges, I tend to approach them methodically..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="min-h-36 resize-none text-base leading-relaxed border border-white/30 focus:border-white/50 focus:ring-white/20 bg-white/5 text-white placeholder-white/50"
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-white/50">
                    {userInput.length} characters
                  </span>
                  <span className="text-xs text-white/50">Text to Analyze</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analyze Button with Model Toggle */}
          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-stone-400">Model:</span>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-40 h-9 text-sm border border-stone-600 focus:border-stone-500 focus:ring-stone-500/20 bg-stone-700/40 text-stone-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-stone-800 border-stone-700">
                  {Object.entries(models).map(([key, name]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="text-stone-200 focus:bg-stone-700 focus:text-stone-100"
                    >
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={loading || !systemPrompt.trim() || !userInput.trim()}
              className="px-12 h-11 text-base font-medium bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-stone-600 flex items-center justify-center"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>

          {/* INTERACTIVE Analysis Results */}
          {analysis && (
            <Card
              style={{ backgroundColor: "rgba(48, 48, 48, 0.8)" }}
              className="border-none shadow-sm"
            >
              <CardHeader>
                <CardTitle className="text-xl font-medium text-white">
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(analysis).map(([category, traits]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="text-lg font-medium text-white border-b border-white/30 pb-2">
                      {category}
                    </h3>

                    <div className="space-y-2">
                      {Object.entries(traits).map(([trait, data]) => {
                        const traitKey = `${category}-${trait}`;
                        const isExpanded = expandedTraits.has(traitKey);

                        return (
                          <div key={trait} className="w-full">
                            <Collapsible>
                              <CollapsibleTrigger
                                onClick={() => toggleTrait(traitKey)}
                                className="w-full"
                              >
                                <div className="bg-white/5 hover:bg-white/10 cursor-pointer transition-all duration-200 px-4 py-3 rounded-lg border border-white/20 flex items-center justify-between w-full">
                                  <span className="text-white font-medium">
                                    {trait}
                                  </span>
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={`text-sm px-2 py-1 rounded-md border font-medium ${getScoreColor(
                                        data.score
                                      )}`}
                                    >
                                      {Math.round(data.score * 100)}%
                                    </span>

                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4 text-white/50" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-white/50" />
                                    )}
                                  </div>
                                </div>
                              </CollapsibleTrigger>

                              <CollapsibleContent className="mt-2">
                                <div className="bg-white/5 rounded-lg p-4 space-y-3 border border-white/20 ml-2">
                                  <div>
                                    <span className="text-sm font-medium text-white/60">
                                      Evidence:
                                    </span>
                                    <p className="text-sm text-white/50 mt-1 leading-relaxed">
                                      {data.evidence}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-white/60">
                                      Analysis:
                                    </span>
                                    <p className="text-sm text-white/50 mt-1 leading-relaxed">
                                      {data.analysis}
                                    </p>
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
