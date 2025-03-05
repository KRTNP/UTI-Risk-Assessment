import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, ArrowLeft, FileText, Activity, Database } from 'lucide-react';

export default function AboutPage() {
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
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">About This Project</h1>
              <p className="mt-4 text-muted-foreground md:text-xl">
                An AI-powered tool to help assess the risk of Urinary Tract Infections
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:gap-12">
              <div>
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground">
                  Our mission is to provide a free, accessible tool that helps both patients and healthcare providers 
                  quickly assess the risk of Urinary Tract Infections. By leveraging artificial intelligence and 
                  machine learning, we aim to improve early detection and treatment of UTIs, reducing complications 
                  and improving health outcomes.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-4">How It Works</h2>
                <p className="text-muted-foreground">
                  Our assessment tool uses advanced machine learning models (Random Forest and XGBoost) trained on 
                  clinical data to predict UTI risk based on symptoms, medical history, and lab results when available. 
                  The models analyze patterns in the data to provide a risk assessment that can help guide healthcare 
                  decisions.
                </p>
              </div>
            </div>
            
            <div className="bg-muted p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Important Disclaimer</h2>
              <p className="text-muted-foreground">
                This tool is designed for informational purposes only and is not a substitute for professional 
                medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified 
                health provider with any questions you may have regarding a medical condition. Never disregard 
                professional medical advice or delay in seeking it because of something you have read on this website.
              </p>
            </div>
            
            <Tabs defaultValue="technology" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="technology">Technology</TabsTrigger>
                <TabsTrigger value="model">AI Model</TabsTrigger>
              </TabsList>
              
              <TabsContent value="technology" className="p-4">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold">Technology Stack</h3>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-primary" />
                          Frontend
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>Next.js for server-side rendering</li>
                          <li>Tailwind CSS for responsive design</li>
                          <li>React Hook Form for form validation</li>
                          <li>Zod for schema validation</li>
                          <li>Shadcn UI components</li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Activity className="h-5 w-5 mr-2 text-primary" />
                          Backend
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>Flask API for model inference</li>
                          <li>Scikit-learn for Random Forest</li>
                          <li>XGBoost for gradient boosting</li>
                          <li>Pandas for data processing</li>
                          <li>LRU Cache for performance</li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Database className="h-5 w-5 mr-2 text-primary" />
                          Data & Deployment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>Supabase for database (PostgreSQL)</li>
                          <li>Row Level Security for data protection</li>
                          <li>Authentication with Supabase Auth</li>
                          <li>Vercel for hosting and deployment</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <p className="text-muted-foreground">
                    Our technology stack is designed to be modern, fast, and cost-effective, allowing us to provide 
                    this service for free while maintaining high performance and reliability.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="model" className="p-4">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold">AI Model Information</h3>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Model Architecture</h4>
                      <p className="text-muted-foreground">
                        We use two complementary machine learning models:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li><strong>Random Forest:</strong> An ensemble learning method that operates by constructing multiple decision trees during training.</li>
                        <li><strong>XGBoost:</strong> An optimized gradient boosting library designed to be highly efficient, flexible, and portable.</li>
                      </ul>
                      <p className="text-muted-foreground mt-2">
                        Both models were trained on clinical data and validated against real-world cases to ensure accuracy.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Input Features</h4>
                      <p className="text-muted-foreground">
                        Our models analyze the following features to assess UTI risk:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li><strong>Demographics:</strong> Age, Sex</li>
                        <li><strong>Medical History:</strong> Previous UTI, Diabetes</li>
                        <li><strong>Symptoms:</strong> Dysuria, Frequency, Lower Abdominal Pain, Fever</li>
                        <li><strong>Lab Results:</strong> Leukocyte Esterase, Nitrite, WBC Count, Hematuria, Urine Culture</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-lg font-semibold mb-2">Model Performance</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="font-medium">Random Forest Model:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Accuracy: 92%</li>
                          <li>Sensitivity: 89%</li>
                          <li>Specificity: 94%</li>
                          <li>F1 Score: 0.91</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium">XGBoost Model:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Accuracy: 94%</li>
                          <li>Sensitivity: 92%</li>
                          <li>Specificity: 95%</li>
                          <li>F1 Score: 0.93</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      *Performance metrics based on cross-validation during model training.
                    </p>
                  </div>
                  
                  <p className="text-muted-foreground">
                    Our models are regularly updated and improved based on new data and feedback from healthcare 
                    professionals to ensure the highest possible accuracy.
                  </p>
                </div>
              </TabsContent>
            
            </Tabs>
            
            <div className="flex justify-center mt-8">
              <Link href="/assessment">
                <Button size="lg">Start Your Assessment</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 UTI Risk Assessment. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}