"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuthStore, useUserStore } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';

// Define the form schema with Zod
const formSchema = z.object({
  Age: z.coerce.number().min(0, "Age must be a positive number").max(120, "Age must be less than 120"),
  Sex: z.enum(["Male", "Female"], { required_error: "Sex is required" }),
  Previous_UTI: z.enum(["Yes", "No"], { required_error: "Previous UTI information is required" }),
  Diabetes: z.enum(["Yes", "No"], { required_error: "Diabetes information is required" }),
  Dysuria: z.enum(["Yes", "No"], { required_error: "Dysuria information is required" }),
  Frequency: z.enum(["Yes", "No"], { required_error: "Frequency information is required" }),
  Lower_Abdominal_Pain: z.enum(["Yes", "No"], { required_error: "Lower abdominal pain information is required" }),
  Fever: z.enum(["Yes", "No"], { required_error: "Fever information is required" }),
  Leukocyte_Esterase: z.enum(["Positive", "Negative", "Unknown"]).optional(),
  Nitrite: z.enum(["Positive", "Negative", "Unknown"]).optional(),
  WBC_Count: z.coerce.number().min(0).optional(),
  Hematuria: z.enum(["Yes", "No", "Unknown"]).optional(),
  Urine_Culture: z.enum(["Positive", "Negative", "Unknown"]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AssessmentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  type PredictionResult = {
    random_forest: {
      prediction: string;
      probability: number;
    };
    xgboost: {
      prediction: string;
      probability: number;
    };
  };
  
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [activeTab, setActiveTab] = useState("symptoms");
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const addAssessment = useUserStore(state => state.addAssessment);
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Age: 30,
      Sex: "Female",
      Previous_UTI: "No",
      Diabetes: "No",
      Dysuria: "No",
      Frequency: "No",
      Lower_Abdominal_Pain: "No",
      Fever: "No",
      Leukocyte_Esterase: "Unknown",
      Nitrite: "Unknown",
      WBC_Count: 0,
      Hematuria: "Unknown",
      Urine_Culture: "Unknown",
    },
  });
  
  // Handle form submission
  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);

    try {
      // Clean up data - convert "Unknown" to undefined for optional fields
      const cleanData = { ...data };

      if (cleanData.Leukocyte_Esterase === "Unknown") cleanData.Leukocyte_Esterase = undefined;
      if (cleanData.Nitrite === "Unknown") cleanData.Nitrite = undefined;
      if (cleanData.Hematuria === "Unknown") cleanData.Hematuria = undefined;
      if (cleanData.Urine_Culture === "Unknown") cleanData.Urine_Culture = undefined;
      if (cleanData.WBC_Count === 0) cleanData.WBC_Count = undefined;

      // Make API call to get prediction
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get prediction');
      }

      const resultData = await response.json();

      // Set the result
      setResult(resultData.prediction);

      // Save assessment to store
      const assessment = {
        id: uuidv4(),
        date: new Date().toISOString(),
        ...cleanData,
        result: {
          rf_prediction: resultData.prediction.random_forest.prediction,
          rf_probability: resultData.prediction.random_forest.probability,
          xgb_prediction: resultData.prediction.xgboost.prediction,
          xgb_probability: resultData.prediction.xgboost.probability,
          risk: resultData.prediction.random_forest.prediction === "UTI" ? "High" : "Low",
          probability: resultData.prediction.random_forest.probability,
          model: "Random Forest & XGBoost"
        }
      };

      addAssessment(assessment);

      toast({
        title: "Assessment Complete",
        description: "Your UTI risk assessment has been completed successfully.",
      });

      // Navigate to results tab
      navigateToTab("results");

    } catch (error: any) {
      console.error("Error submitting assessment:", error);
      toast({
        variant: "destructive",
        title: "Assessment Failed",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Function to navigate between tabs
  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
  };
  
  // Function to determine if a tab should be disabled
  const isTabDisabled = (tab: string) => {
    if (tab === "symptoms") return false;
    if (tab === "lab-results") return false;
    if (tab === "results") return !result;
    return false;
  };
  
  // Function to handle "Next" button clicks
  const handleNext = () => {
    if (activeTab === "symptoms") {
      navigateToTab("lab-results");
    } else if (activeTab === "lab-results") {
      form.handleSubmit(onSubmit)();
    }
  };
  
  // Function to handle "Back" button clicks
  const handleBack = () => {
    if (activeTab === "lab-results") {
      navigateToTab("symptoms");
    } else if (activeTab === "results") {
      navigateToTab("lab-results");
    }
  };
  
  // Function to start a new assessment
  const handleNewAssessment = () => {
    form.reset();
    setResult(null);
    navigateToTab("symptoms");
  };
  
  // Function to view assessment history (redirect to dashboard)
  const handleViewHistory = () => {
    router.push('/dashboard');
  };
  
  // Function to determine risk level color
  const getRiskColor = (prediction: string) => {
    return prediction === "UTI" ? "text-red-600" : "text-green-600";
  };
  
  // Function to determine risk level background color
  const getRiskBgColor = (prediction: string) => {
    return prediction === "UTI" ? "bg-red-100" : "bg-green-100";
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="ml-auto flex items-center">
            <ShieldCheck className="h-6 w-6 text-primary mr-2" />
            <span className="text-xl font-bold">UTI Risk Assessment</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">UTI Risk Assessment</h1>
            <p className="mt-4 text-muted-foreground">
              Complete the form below to assess your risk of Urinary Tract Infection.
              Our AI model will analyze your symptoms and provide a risk assessment.
            </p>
            
            {!isAuthenticated && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Not logged in</AlertTitle>
                <AlertDescription>
                  You are not logged in. Your assessment will not be saved to your account.{" "}
                  <Link href="/login" className="font-medium underline underline-offset-4">
                    Login or register
                  </Link>{" "}
                  to save your assessment history.
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="symptoms" disabled={isSubmitting}>
                Symptoms & History
              </TabsTrigger>
              <TabsTrigger value="lab-results" disabled={isSubmitting}>
                Lab Results (Optional)
              </TabsTrigger>
              <TabsTrigger value="results" disabled={isTabDisabled("results") || isSubmitting}>
                Results
              </TabsTrigger>
            </TabsList>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <TabsContent value="symptoms" className="p-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Demographics & Medical History</CardTitle>
                      <CardDescription>
                        Please provide your basic information and medical history.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="Age"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Age</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Enter your age" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="Sex"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sex</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="Female" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Female
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="Male" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Male
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="Previous_UTI"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Previous UTI</FormLabel>
                              <FormDescription>
                                Have you had a UTI before?
                              </FormDescription>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="Yes" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Yes
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="No" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      No
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="Diabetes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Diabetes</FormLabel>
                              <FormDescription>
                                Do you have diabetes?
                              </FormDescription>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="Yes" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Yes
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="No" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      No
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Symptoms</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="Dysuria"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Dysuria</FormLabel>
                                <FormDescription>
                                  Pain or burning sensation when urinating
                                </FormDescription>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Yes" />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        Yes
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="No" />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        No
                                      </FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="Frequency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Frequency</FormLabel>
                                <FormDescription>
                                  Frequent need to urinate
                                </FormDescription>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Yes" />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        Yes
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="No" />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        No
                                      </FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="Lower_Abdominal_Pain"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Lower Abdominal Pain</FormLabel>
                                <FormDescription>
                                  Pain in the lower abdomen or pelvic area
                                </FormDescription>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Yes" />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        Yes
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="No" />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        No
                                      </FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="Fever"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fever</FormLabel>
                                <FormDescription>
                                  Elevated body temperature
                                </FormDescription>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="Yes" />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        Yes
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="No" />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        No
                                      </FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" type="button" onClick={() => router.push('/')}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleNext}>
                        Next
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="lab-results" className="p-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Laboratory Results</CardTitle>
                      <CardDescription>
                        If you have laboratory test results, please provide them below.
                        These are optional but will improve the accuracy of the assessment.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="Leukocyte_Esterase"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Leukocyte Esterase</FormLabel>
                              <FormDescription>
                                Urine dipstick test for white blood cells
                              </FormDescription>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select result" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Positive">Positive</SelectItem>
                                  <SelectItem value="Negative">Negative</SelectItem>
                                  <SelectItem value="Unknown">Unknown/Not Tested</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="Nitrite"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nitrite</FormLabel>
                              <FormDescription>
                                Urine dipstick test for bacteria
                              </FormDescription>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select result" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Positive">Positive</SelectItem>
                                  <SelectItem value="Negative">Negative</SelectItem>
                                  <SelectItem value="Unknown">Unknown/Not Tested</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="WBC_Count"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>WBC Count</FormLabel>
                              <FormDescription>
                                White blood cell count in urine (cells/hpf)
                              </FormDescription>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Enter WBC count" 
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value === '' ? '0' : e.target.value;
                                    field.onChange(parseInt(value, 10));
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="Hematuria"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hematuria</FormLabel>
                              <FormDescription>
                                Blood in urine
                              </FormDescription>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select result" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Yes">Yes</SelectItem>
                                  <SelectItem value="No">No</SelectItem>
                                  <SelectItem value="Unknown">Unknown/Not Tested</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="Urine_Culture"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Urine Culture</FormLabel>
                              <FormDescription>
                                Laboratory test to identify bacteria in urine
                              </FormDescription>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select result" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Positive">Positive</SelectItem>
                                  <SelectItem value="Negative">Negative</SelectItem>
                                  <SelectItem value="Unknown">Unknown/Not Tested</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" type="button" onClick={handleBack}>
                        Back
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Submit Assessment"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="results" className="p-4">
                  {result && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Assessment Results</CardTitle>
                        <CardDescription>
                          Based on your provided information, here is your UTI risk assessment.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className={`p-6 rounded-lg ${getRiskBgColor(result.random_forest.prediction)}`}>
                            <h3 className="text-lg font-semibold mb-2">Random Forest Model</h3>
                            <div className="flex items-center mb-2">
                              <span className="text-2xl font-bold mr-2 flex items-center">
                                {result.random_forest.prediction === "UTI" ? (
                                  <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
                                ) : (
                                  <CheckCircle2 className="h-6 w-6 text-green-600 mr-2" />
                                )}
                                <span className={getRiskColor(result.random_forest.prediction)}>
                                  {result.random_forest.prediction}
                                </span>
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Confidence: <span className="font-semibold">{result.random_forest.probability}%</span>
                            </p>
                          </div>
                          
                          <div className={`p-6 rounded-lg ${getRiskBgColor(result.xgboost.prediction)}`}>
                            <h3 className="text-lg font-semibold mb-2">XGBoost Model</h3>
                            <div className="flex items-center mb-2">
                              <span className="text-2xl font-bold mr-2 flex items-center">
                                {result.xgboost.prediction === "UTI" ? (
                                  <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
                                ) : (
                                  <CheckCircle2 className="h-6 w-6 text-green-600 mr-2" />
                                )}
                                <span className={getRiskColor(result.xgboost.prediction)}>
                                  {result.xgboost.prediction}
                                </span>
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Confidence: <span className="font-semibold">{result.xgboost.probability}%</span>
                            </p>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="bg-muted p-6 rounded-lg">
                          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                          
                          {result.random_forest.prediction === "UTI" || result.xgboost.prediction === "UTI" ? (
                            <div className="space-y-4">
                              <p>
                                Based on your assessment, you have a <strong>high risk</strong> of having a Urinary Tract Infection.
                                We recommend the following:
                              </p>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>Consult with a healthcare provider as soon as possible</li>
                                <li>Drink plenty of water to help flush bacteria from your urinary tract</li>
                                <li>Avoid caffeine, alcohol, and spicy foods which can irritate your bladder</li>
                                <li>Take over-the-counter pain relievers if needed for discomfort</li>
                                <li>Complete the full course of antibiotics if prescribed by your doctor</li>
                              </ul>
                              <Alert className="mt-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Important</AlertTitle>
                                <AlertDescription>
                                  This assessment is not a substitute for professional medical advice. 
                                  Please consult with a healthcare provider for proper diagnosis and treatment.
                                </AlertDescription>
                              </Alert>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <p>
                                Based on your assessment, you have a <strong>low risk</strong> of having a Urinary Tract Infection.
                                We recommend the following preventive measures:
                              </p>
                              <ul className="list-disc pl-5 space-y-2">
                                <li>Stay hydrated by drinking plenty of water</li>
                                <li>Urinate when you feel the need; don't hold it in</li>
                                <li>Wipe from front to back after using the toilet</li>
                                <li>Empty your bladder before and after sexual activity</li>
                                <li>Consider cranberry products which may help prevent UTIs</li>
                              </ul>
                              <p>
                                If you develop symptoms such as painful urination, frequent urination, or lower abdominal pain,
                                please consult with a healthcare provider.
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" type="button" onClick={handleNewAssessment}>
                          New Assessment
                        </Button>
                        {isAuthenticated ? (
                          <Button type="button" onClick={handleViewHistory}>
                            View History
                          </Button>
                        ) : (
                          <Button type="button" onClick={() => router.push('/login')}>
                            Login to Save
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  )}
                </TabsContent>
              </form>
            </Form>
          </Tabs>
        </div>
      </main>
      
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 UTI Risk Assessment. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground underline underline-offset-4">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground underline underline-offset-4">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}