import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stethoscope, ShieldCheck, FileText, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="ml-2 text-xl font-bold">UTI Risk Assessment</span>
          </div>
          <nav className="flex flex-1 items-center justify-end space-x-4">
            <Link href="/assessment" className="text-sm font-medium transition-colors hover:text-primary">
              Assessment
            </Link>
            <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
              About
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  AI-Powered UTI Risk Assessment
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Get an instant assessment of your Urinary Tract Infection risk using our advanced AI model.
                  Free, secure, and accurate.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/assessment">
                    <Button size="lg">Start Assessment</Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline" size="lg">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center">
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Medical professional"
                  className="rounded-lg object-cover aspect-video"
                  width={600}
                  height={400}
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our AI-powered assessment tool uses advanced machine learning to evaluate your UTI risk.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
              <Card className="flex flex-col items-center text-center">
                <CardHeader>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Complete Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Fill out a simple form with your symptoms, medical history, and lab results if available.
                  </p>
                </CardContent>
              </Card>
              <Card className="flex flex-col items-center text-center">
                <CardHeader>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>AI Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our AI model analyzes your data using advanced algorithms trained on medical datasets.
                  </p>
                </CardContent>
              </Card>
              <Card className="flex flex-col items-center text-center">
                <CardHeader>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Stethoscope className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Get Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Receive an instant risk assessment with recommendations for next steps.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Comprehensive tools for both patients and healthcare providers.
                </p>
              </div>
            </div>
            <div className="mx-auto mt-8">
              <Tabs defaultValue="patients" className="w-full max-w-4xl mx-auto">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="patients">For Patients</TabsTrigger>
                  <TabsTrigger value="doctors">For Doctors</TabsTrigger>
                </TabsList>
                <TabsContent value="patients" className="p-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:gap-8">
                    <Card>
                      <CardHeader>
                        <CardTitle>Risk Assessment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>Complete a comprehensive assessment form to get an instant UTI risk evaluation.</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Assessment History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>Track your assessment history and monitor changes in your condition over time.</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Educational Resources</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>Access reliable information about UTI prevention, symptoms, and treatment options.</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Secure Data</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>Your health information is encrypted and securely stored with strict privacy controls.</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="doctors" className="p-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:gap-8">
                    <Card>
                      <CardHeader>
                        <CardTitle>Patient Dashboard</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>View and analyze assessment data from your patients in a comprehensive dashboard.</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Search & Filter</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>Easily search and filter patient records to find relevant information quickly.</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>AI Feedback</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>Provide feedback on AI predictions to help improve the model's accuracy over time.</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Secure Access</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>Role-based access ensures you only see data from your own patients with proper authorization.</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
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