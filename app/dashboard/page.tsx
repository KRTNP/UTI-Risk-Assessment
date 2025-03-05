"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShieldCheck,
  ArrowLeft,
  Search,
  UserCircle,
  FileText,
  BarChart,
  Download,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { useAuthStore, useUserStore, type Assessment } from "@/lib/store";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { supabase, getAllPredictions, UTIPrediction } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { assessments, addAssessment } = useUserStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>(
    []
  );
  const [supabaseAssessments, setSupabaseAssessments] = useState<
    UTIPrediction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Load assessments from Supabase
  useEffect(() => {
    async function loadAssessments() {
      if (user?.id) {
        setIsLoading(true);
        setLoadError(null);
        try {
          const predictions = await getAllPredictions();
          setSupabaseAssessments(predictions);

          // Convert Supabase predictions to local format and add to store
          predictions.forEach((prediction: UTIPrediction) => {
            const assessment: Assessment = {
              id: prediction.id,
              date: prediction.created_at,
              Age: prediction.age,
              Sex: prediction.sex,
              Previous_UTI: prediction.previous_uti,
              Diabetes: prediction.diabetes,
              Dysuria: prediction.dysuria,
              Frequency: prediction.frequency,
              Lower_Abdominal_Pain: prediction.lower_abdominal_pain,
              Fever: prediction.fever,
              Leukocyte_Esterase: prediction.leukocyte_esterase || undefined,
              Nitrite: prediction.nitrite || undefined,
              WBC_Count: prediction.wbc_count || undefined,
              Hematuria: prediction.hematuria || undefined,
              Urine_Culture: prediction.urine_culture || undefined,
              result: {
                rf_prediction: prediction.rf_prediction,
                rf_probability: prediction.rf_probability,
                xgb_prediction: prediction.xgb_prediction,
                xgb_probability: prediction.xgb_probability,
                risk: prediction.rf_prediction === "UTI" ? "High" : "Low",
                probability: prediction.rf_probability,
                model: "Random Forest & XGBoost",
              },
            };

            // Only add if not already in store
            if (!assessments.some((a) => a.id === assessment.id)) {
              addAssessment(assessment);
            }
          });

          console.log("Assessments after loading:", assessments); // Log assessments after loading
        } catch (error: any) {
          console.error("Error loading assessments:", error);
          setLoadError(
            "Failed to load your assessments. Please try again later."
          );
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadAssessments();
  }, [user, addAssessment, assessments]);

  // Filter assessments based on search term
  useEffect(() => {
    if (assessments.length > 0) {
      const filtered = assessments.filter((assessment) => {
        const searchString =
          `${assessment.id} ${assessment.date} ${assessment.Age} ${assessment.Sex} ${assessment.result.risk}`.toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
      });
      setFilteredAssessments(filtered);
    } else {
      setFilteredAssessments([]);
    }
  }, [searchTerm, assessments]);

  // Calculate statistics for charts
  const highRiskCount = assessments.filter(
    (a) => a.result.risk === "High"
  ).length;
  const lowRiskCount = assessments.filter(
    (a) => a.result.risk === "Low"
  ).length;

  const riskData = [
    { name: "High Risk", value: highRiskCount },
    { name: "Low Risk", value: lowRiskCount },
  ];

  const COLORS = ["#ef4444", "#22c55e"];

  const symptomData = [
    {
      name: "Dysuria",
      value: assessments.filter((a) => a.Dysuria === "Yes").length,
    },
    {
      name: "Frequency",
      value: assessments.filter((a) => a.Frequency === "Yes").length,
    },
    {
      name: "Abdominal Pain",
      value: assessments.filter((a) => a.Lower_Abdominal_Pain === "Yes").length,
    },
    {
      name: "Fever",
      value: assessments.filter((a) => a.Fever === "Yes").length,
    },
  ];

  const SYMPTOM_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316"];

  // Model comparison data
  const modelComparisonData = assessments.map((a) => ({
    id: a.id.substring(0, 8),
    RF: a.result.rf_probability,
    XGBoost: a.result.xgb_probability,
  }));

  // console.log("Risk Data:", riskData); // Log riskData
  // console.log("Symptom Data:", symptomData); // Log symptomData
  // console.log("Model Comparison Data:", modelComparisonData); // Log modelComparisonData

  // Export data as CSV
  const exportData = () => {
    if (assessments.length === 0) return;

    const headers = [
      "ID",
      "Date",
      "Age",
      "Sex",
      "Previous UTI",
      "Diabetes",
      "Dysuria",
      "Frequency",
      "Lower Abdominal Pain",
      "Fever",
      "Leukocyte Esterase",
      "Nitrite",
      "WBC Count",
      "Hematuria",
      "Urine Culture",
      "RF Prediction",
      "RF Probability",
      "XGBoost Prediction",
      "XGBoost Probability",
    ];

    const csvData = assessments.map((a) => [
      a.id,
      a.date,
      a.Age,
      a.Sex,
      a.Previous_UTI,
      a.Diabetes,
      a.Dysuria,
      a.Frequency,
      a.Lower_Abdominal_Pain,
      a.Fever,
      a.Leukocyte_Esterase || "Unknown",
      a.Nitrite || "Unknown",
      a.WBC_Count || "Unknown",
      a.Hematuria || "Unknown",
      a.Urine_Culture || "Unknown",
      a.result.rf_prediction,
      a.result.rf_probability,
      a.result.xgb_prediction,
      a.result.xgb_probability,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "uti_assessments.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      useAuthStore.getState().logout();
      router.push("/login");
    } catch (error: any) {
      console.error("Error logging out:", error);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

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
            <Button variant="ghost" className="ml-4" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        {loadError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCircle className="h-5 w-5 mr-2" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{user?.name || "User"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium capitalize">
                      {user?.role || "patient"}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>

            <div className="mt-6 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/assessment">
                  <FileText className="h-4 w-4 mr-2" />
                  New Assessment
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={exportData}
                disabled={assessments.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          <div className="md:w-3/4">
            <Tabs defaultValue="assessments" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="assessments">Assessments</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="assessments" className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search assessments..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button className="ml-2" asChild>
                      <Link href="/assessment">
                        <FileText className="h-4 w-4 mr-2" />
                        New Assessment
                      </Link>
                    </Button>
                  </div>

                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
                      <h3 className="text-lg font-medium">
                        Loading assessments...
                      </h3>
                    </div>
                  ) : filteredAssessments.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Sex</TableHead>
                            <TableHead>RF Prediction</TableHead>
                            <TableHead>XGBoost Prediction</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAssessments.map((assessment) => (
                            <TableRow key={assessment.id}>
                              <TableCell>
                                {new Date(assessment.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{assessment.Age}</TableCell>
                              <TableCell>{assessment.Sex}</TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    assessment.result.rf_prediction === "UTI"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {assessment.result.rf_prediction} (
                                  {assessment.result.rf_probability}%)
                                </span>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    assessment.result.xgb_prediction === "UTI"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {assessment.result.xgb_prediction} (
                                  {assessment.result.xgb_probability}%)
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">
                        No assessments found
                      </h3>
                      <p className="text-muted-foreground mt-2">
                        {assessments.length === 0
                          ? "You haven't completed any assessments yet."
                          : "No assessments match your search criteria."}
                      </p>
                      <Button className="mt-4" asChild>
                        <Link href="/assessment">Start New Assessment</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="p-4">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Assessment Analytics</h3>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Risk Distribution</CardTitle>
                        <CardDescription>
                          Distribution of high and low risk assessments
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        {assessments.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={riskData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                  `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {riskData.map((_, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">
                              No data available
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Symptom Frequency</CardTitle>
                        <CardDescription>
                          Most common symptoms reported
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        {assessments.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={symptomData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                  `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {symptomData.map((_, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      SYMPTOM_COLORS[
                                        index % SYMPTOM_COLORS.length
                                      ]
                                    }
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">
                              No data available
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Model Comparison</CardTitle>
                      <CardDescription>
                        Comparing Random Forest and XGBoost prediction
                        probabilities
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      {assessments.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart
                            data={modelComparisonData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="id" />
                            <YAxis
                              label={{
                                value: "Probability (%)",
                                angle: -90,
                                position: "insideLeft",
                              }}
                            />
                            <Tooltip />
                            <Legend />
                            <Bar
                              dataKey="RF"
                              fill="#8884d8"
                              name="Random Forest"
                            />
                            <Bar
                              dataKey="XGBoost"
                              fill="#82ca9d"
                              name="XGBoost"
                            />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground">
                            No data available
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Assessment Summary</CardTitle>
                      <CardDescription>
                        Overview of your assessment history
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            Total Assessments
                          </p>
                          <p className="text-3xl font-bold">
                            {assessments.length}
                          </p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                          <p className="text-sm text-red-600">
                            UTI Predictions (RF)
                          </p>
                          <p className="text-3xl font-bold text-red-700">
                            {
                              assessments.filter(
                                (a) => a.result.rf_prediction === "UTI"
                              ).length
                            }
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-green-600">
                            UTI Predictions (XGBoost)
                          </p>
                          <p className="text-3xl font-bold text-green-700">
                            {
                              assessments.filter(
                                (a) => a.result.xgb_prediction === "UTI"
                              ).length
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
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
