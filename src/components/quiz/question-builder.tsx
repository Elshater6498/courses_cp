import { useState } from "react";
import { Plus, Trash2, GripVertical, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Question, QuestionType } from "@/types/api";

interface QuestionBuilderProps {
  questions: Question[];
  onChange: (questions: Question[]) => void;
}

export function QuestionBuilder({ questions, onChange }: QuestionBuilderProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<string>("");

  const addQuestion = () => {
    const newQuestion: Question = {
      question: { en: "", ar: "", he: "" },
      type: "mcq" as QuestionType,
      options: [
        { text: { en: "", ar: "", he: "" }, isCorrect: false, order: 1 },
        { text: { en: "", ar: "", he: "" }, isCorrect: false, order: 2 },
      ],
      explanation: { en: "", ar: "", he: "" },
      points: 1,
      order: questions.length + 1,
    };
    onChange([...questions, newQuestion]);
    setExpandedQuestion(`question-${questions.length}`);
  };

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    // Reorder remaining questions
    const reordered = updated.map((q, i) => ({ ...q, order: i + 1 }));
    onChange(reordered);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const updateQuestionText = (
    index: number,
    lang: "en" | "ar" | "he",
    value: string
  ) => {
    const updated = [...questions];
    updated[index] = {
      ...updated[index],
      question: { ...updated[index].question, [lang]: value },
    };
    onChange(updated);
  };

  const updateExplanation = (
    index: number,
    lang: "en" | "ar" | "he",
    value: string
  ) => {
    const updated = [...questions];
    updated[index] = {
      ...updated[index],
      explanation: {
        ...(updated[index].explanation || { en: "" }),
        [lang]: value,
      },
    };
    onChange(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    const question = updated[questionIndex];
    const newOrder = question.options.length + 1;
    question.options.push({
      text: { en: "", ar: "", he: "" },
      isCorrect: false,
      order: newOrder,
    });
    onChange(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    const question = updated[questionIndex];
    question.options = question.options.filter((_, i) => i !== optionIndex);
    // Reorder remaining options
    question.options = question.options.map((opt, i) => ({
      ...opt,
      order: i + 1,
    }));
    onChange(updated);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    lang: "en" | "ar" | "he",
    value: string
  ) => {
    const updated = [...questions];
    const option = updated[questionIndex].options[optionIndex];
    option.text = { ...option.text, [lang]: value };
    onChange(updated);
  };

  const toggleCorrectOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    const option = updated[questionIndex].options[optionIndex];
    option.isCorrect = !option.isCorrect;
    onChange(updated);
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === questions.length - 1)
    ) {
      return;
    }

    const updated = [...questions];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    // Update order numbers
    updated[index].order = index + 1;
    updated[newIndex].order = newIndex + 1;

    onChange(updated);
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-gray-500 mb-4">No questions added yet</p>
        <Button onClick={addQuestion}>
          <Plus className="h-4 w-4 mr-2" />
          Add First Question
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Accordion
        type="single"
        collapsible
        value={expandedQuestion}
        onValueChange={setExpandedQuestion}
      >
        {questions.map((question, qIndex) => (
          <AccordionItem key={qIndex} value={`question-${qIndex}`}>
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveQuestion(qIndex, "up")}
                  disabled={qIndex === 0}
                  className="h-6 px-2"
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveQuestion(qIndex, "down")}
                  disabled={qIndex === questions.length - 1}
                  className="h-6 px-2"
                >
                  ↓
                </Button>
              </div>
              <Card className="flex-1 p-0">
                <div className="flex items-center justify-between p-4">
                  <AccordionTrigger className="flex-1 hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">
                        Question {qIndex + 1}
                        {question.question.en &&
                          `: ${question.question.en.substring(0, 50)}${
                            question.question.en.length > 50 ? "..." : ""
                          }`}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({question.points} point
                        {question.points !== 1 ? "s" : ""})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(qIndex)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                <AccordionContent>
                  <div className="p-4 pt-0 space-y-4">
                    {/* Question Text */}
                    <div>
                      <Label>Question Text *</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                        <div>
                          <Input
                            placeholder="English *"
                            value={question.question.en}
                            onChange={(e) =>
                              updateQuestionText(qIndex, "en", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Input
                            placeholder="Arabic"
                            value={question.question.ar || ""}
                            onChange={(e) =>
                              updateQuestionText(qIndex, "ar", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Input
                            placeholder="Hebrew"
                            value={question.question.he || ""}
                            onChange={(e) =>
                              updateQuestionText(qIndex, "he", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Points */}
                    <div>
                      <Label htmlFor={`points-${qIndex}`}>Points</Label>
                      <Input
                        id={`points-${qIndex}`}
                        type="number"
                        min="1"
                        max="100"
                        value={question.points}
                        onChange={(e) =>
                          updateQuestion(
                            qIndex,
                            "points",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-32"
                      />
                    </div>

                    <Separator />

                    {/* Options */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Answer Options *</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(qIndex)}
                          disabled={question.options.length >= 6}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Option
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {question.options.map((option, oIndex) => (
                          <div
                            key={oIndex}
                            className="flex items-start gap-2 p-3 border rounded-lg"
                          >
                            <Checkbox
                              checked={option.isCorrect}
                              onCheckedChange={() =>
                                toggleCorrectOption(qIndex, oIndex)
                              }
                              className="mt-2"
                            />
                            <div className="flex-1 space-y-2">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <Input
                                  placeholder="Option (English) *"
                                  value={option.text.en}
                                  onChange={(e) =>
                                    updateOption(
                                      qIndex,
                                      oIndex,
                                      "en",
                                      e.target.value
                                    )
                                  }
                                />
                                <Input
                                  placeholder="Option (Arabic)"
                                  value={option.text.ar || ""}
                                  onChange={(e) =>
                                    updateOption(
                                      qIndex,
                                      oIndex,
                                      "ar",
                                      e.target.value
                                    )
                                  }
                                />
                                <Input
                                  placeholder="Option (Hebrew)"
                                  value={option.text.he || ""}
                                  onChange={(e) =>
                                    updateOption(
                                      qIndex,
                                      oIndex,
                                      "he",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              {option.isCorrect && (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <Check className="h-4 w-4" />
                                  Correct Answer
                                </div>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(qIndex, oIndex)}
                              disabled={question.options.length <= 2}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Check the box next to correct answer(s)
                      </p>
                    </div>

                    <Separator />

                    {/* Explanation */}
                    <div>
                      <Label>Explanation (Optional)</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                        <Textarea
                          placeholder="English"
                          value={question.explanation?.en || ""}
                          onChange={(e) =>
                            updateExplanation(qIndex, "en", e.target.value)
                          }
                          rows={2}
                        />
                        <Textarea
                          placeholder="Arabic"
                          value={question.explanation?.ar || ""}
                          onChange={(e) =>
                            updateExplanation(qIndex, "ar", e.target.value)
                          }
                          rows={2}
                        />
                        <Textarea
                          placeholder="Hebrew"
                          value={question.explanation?.he || ""}
                          onChange={(e) =>
                            updateExplanation(qIndex, "he", e.target.value)
                          }
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </Card>
            </div>
          </AccordionItem>
        ))}
      </Accordion>

      <Button type="button" onClick={addQuestion} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Question
      </Button>
    </div>
  );
}
