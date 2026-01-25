"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { useEffect, useState } from "react";
import type { UserCredentials, Workflow, INode, CredentialsI } from "@nen/db";
import axios from "axios";
import { toast } from "sonner";
import { BACKEND_URL } from "@/app/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Calendar, Pencil, Save, Trash, Plus, Key } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ExecutionsTabImproved } from "@/app/components/ExecutionsTab";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { CredentialDialogContent } from "@/app/components/CredentialDialogContent";

interface CredentialFormData {
  name?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export const DashboardTabs = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "workflows";

  const [credentials, setCredentials] = useState<UserCredentials[] | null>();
  const [loading, setLoading] = useState(false);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [selectedCred, setSelectedCred] = useState<UserCredentials | null>(
    null
  );
  const [userWorkflows, setUserWorkflows] = useState<Workflow[] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CredentialFormData>({});

  // State for Add Credentials dialog
  const [credApis, setCredApis] = useState<CredentialsI[]>([]);
  const [credName, setCredName] = useState<string>("");
  const [currCredApi, setCredCurrApi] = useState<CredentialsI | null>(null);
  const [isAddCredDialogOpen, setIsAddCredDialogOpen] = useState(false);

  const handleTabChange = (value: string) => {
    router.push(`?tab=${value}`);
  };

  const fetchWorkflows = async () => {
    try {
      setWorkflowLoading(true);
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/workflow/`,
        {
          withCredentials: true,
        }
      );

      setUserWorkflows(res.data.data);
      setWorkflowLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/v1/cred/`, {
        withCredentials: true,
      });
      setCredentials(res.data.data);
    } catch (err) {
      console.error("Error fetching credentials", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
    fetchWorkflows();
  }, []);

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
    setFormData(selectedCred || {});
  };

  const handleChange = (field: string, value: string, nested = false) => {
    if (nested) {
      setFormData((prev: CredentialFormData) => ({
        ...prev,
        data: { ...prev.data, [field]: value },
      }));
    } else {
      setFormData((prev: CredentialFormData) => ({ ...prev, [field]: value }));
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      const res = await axios.delete(
        `${BACKEND_URL}/api/v1/workflow/${workflowId}`,
        {
          withCredentials: true,
        }
      );

      if (res) {
        toast.success("Workflow deleted successfully");
      }
      fetchWorkflows();
    } catch (error) {
      toast.error("Failed to delete workflow");
      console.log(error);
    }
  };

  const handleSave = async () => {
    if (!selectedCred) return;
    try {
      await axios.put(
        `${BACKEND_URL}/api/v1/cred/${selectedCred.id}`,
        formData,
        { withCredentials: true }
      );
      toast.success("Credential updated successfully!");
      fetchCredentials();
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating credential", err);
      toast.error("Failed to update credential");
    }
  };

  return (
    <div className="flex w-full">
      <Tabs
        className="flex flex-row w-full"
        value={currentTab}
        onValueChange={handleTabChange}
        orientation="vertical"
      >
        {/* Vertical Sidebar */}
        <div className="w-56 min-h-[calc(100vh-60px)] border-r border-white/20 bg-black p-4 flex flex-col">
          {/* Action Buttons */}
          <div className="flex flex-col gap-2 mb-4">
            <Link href="/create">
              <Button className="w-full justify-start gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg">
                <Plus className="h-4 w-4" />
                Create Workflow
              </Button>
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 my-2"></div>

          {/* Tab Navigation */}
          <TabsList className="flex flex-col w-full gap-1 bg-transparent h-auto">
            <TabsTrigger
              className="w-full justify-start px-4 py-3 text-left rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-white/5 transition-colors text-gray-400"
              value="workflows"
            >
              WorkFlows
            </TabsTrigger>
            <TabsTrigger
              className="w-full justify-start px-4 py-3 text-left rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-white/5 transition-colors text-gray-400"
              value="credentials"
            >
              Credentials
            </TabsTrigger>
            <TabsTrigger
              className="w-full justify-start px-4 py-3 text-left rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-white/5 transition-colors text-gray-400"
              value="executions"
            >
              Executions
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">

          <TabsContent value="workflows">
            <div className="mb-3 text-lg font-semibold">Workflows</div>

            {workflowLoading && (
              <div className="flex justify-center items-center py-6">
                <div className="h-6 w-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-teal-600">Loading...</span>
              </div>
            )}

            {!workflowLoading && userWorkflows && userWorkflows.length === 0 && (
              <p className="text-gray-500">No workflows found.</p>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {!workflowLoading &&
                userWorkflows &&
                userWorkflows.map((wf) => (
                  <Card
                    key={wf.id}
                    onClick={() => {
                      router.push(`/workflow/${wf.id}`);
                    }}
                    className={`shadow-sm cursor-pointer py-4 px-0 hover:shadow-md transition rounded-xl gap-2 border ${(wf as Workflow & { deletedAt?: Date }).deletedAt ? "bg-red-950/20 border-red-900/30" : "bg-white/5 border-white/10"
                      }`}
                  >
                    <CardHeader className="flex flex-row items-center justify-between px-3 gap-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="flw text-base text-white">{wf.name}</CardTitle>
                        {(wf as Workflow & { deletedAt?: Date }).deletedAt && (
                          <span className="px-2 py-0.5 rounded text-xs bg-red-900/30 text-red-300 border border-red-800/50 font-medium">
                            Deleted
                          </span>
                        )}
                      </div>
                      {!(wf as Workflow & { deletedAt?: Date }).deletedAt && (
                        <Trash
                          width={20}
                          onClick={(e) => {
                            e.stopPropagation(); // prevent card navigation
                            handleDeleteWorkflow(wf.id);
                          }}
                          className="cursor-pointer z-10 text-red-800 transition-transform duration-200 hover:scale-110"
                        />
                      )}
                    </CardHeader>
                    <CardContent className="text-sm px-3 space-y-2">
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                        {(wf as Workflow & { description?: string }).description || "No description provided"}
                      </p>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Created: {new Date(wf.createdAt!).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Updated: {new Date(wf.updatedAt!).toLocaleDateString()}
                        </span>
                      </div>
                      {wf.nodes && Array.isArray(wf.nodes) && wf.nodes.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <div className="text-xs font-semibold text-gray-300 mb-1">
                            Nodes ({wf.nodes.length}):
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(wf.nodes as INode[]).slice(0, 5).map((node, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-white/10 text-gray-300 border border-white/20"
                              >
                                {node.type || 'Node'}
                              </span>
                            ))}
                            {wf.nodes.length > 5 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-white/5 text-gray-400">
                                +{wf.nodes.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="credentials">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Credentials</h2>
                <Dialog open={isAddCredDialogOpen} onOpenChange={setIsAddCredDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={async () => {
                        try {
                          const res = await axios.get(
                            `${BACKEND_URL}/api/v1/cred/apis`,
                            { withCredentials: true }
                          );
                          setCredApis(res.data.data);
                        } catch (error) {
                          console.error("Failed to fetch credential APIs", error);
                          toast.error("Failed to load credential types");
                        }
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Credentials
                    </Button>
                  </DialogTrigger>
                  <CredentialDialogContent
                    credApis={credApis}
                    credName={credName}
                    currCredApi={currCredApi}
                    setCredName={setCredName}
                    setCredCurrApi={setCredCurrApi}
                    onSuccess={() => {
                      setIsAddCredDialogOpen(false);
                      fetchCredentials();
                    }}
                  />
                </Dialog>
              </div>

              {loading && (
                <div className="flex justify-center items-center py-6">
                  <div className="h-6 w-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-teal-600">Loading...</span>
                </div>
              )}

              {!loading && credentials && credentials.length === 0 && (
                <p className="text-gray-500">No credentials found.</p>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {!loading &&
                  credentials &&
                  credentials.map((cred) => (
                    <Dialog
                      key={cred.id}
                      onOpenChange={(open) => {
                        if (!open) {
                          setSelectedCred(null);
                          setIsEditing(false);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Card
                          onClick={() => setSelectedCred(cred)}
                          className="shadow-sm cursor-pointer py-4 px-0 hover:shadow-md transition rounded-xl gap-2 border border-white/10 bg-white/5"
                        >
                          <CardHeader className="flex flex-row justify-between items-center px-3 gap-2">
                            <div className="flex flex-row items-center gap-2">
                              <img src={cred.appIcon} width={30} alt="" />
                              <CardTitle className="text-base">
                                {cred.name}
                              </CardTitle>
                            </div>
                            <Trash
                              className="text-red-800 cursor-pointer transition-transform duration-200 hover:scale-110"
                              width={20}
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const res = await axios.delete(
                                    `${BACKEND_URL}/api/v1/cred/${cred.id}`,
                                    { withCredentials: true }
                                  );

                                  if (res.status === 200) {
                                    setCredentials((prev) =>
                                      prev!.filter((c) => c.id !== cred.id)
                                    );
                                    toast.success("Credential deleted successfully");
                                    console.log(
                                      "Credential deleted successfully"
                                    );
                                  }
                                } catch (err) {
                                  console.error(
                                    "Failed to delete credential",
                                    err
                                  );
                                }
                              }}
                            />
                          </CardHeader>
                          <CardContent className="text-sm px-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>
                                Created:{" "}
                                {new Date(cred.createdAt!).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>
                                Updated:{" "}
                                {new Date(cred.updatedAt!).toLocaleDateString()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </DialogTrigger>

                      <DialogContent className="max-w-lg bg-white border-teal-200">
                        <DialogHeader className="flex flex-row justify-between items-center">
                          <DialogTitle className="text-teal-700">
                            Credential Details
                          </DialogTitle>
                          {!isEditing && (
                            <Pencil
                              onClick={handleEditToggle}
                              className="h-5 w-5 cursor-pointer text-teal-600"
                            />
                          )}
                        </DialogHeader>

                        {selectedCred && (
                          <div className="space-y-3 mt-4">
                            <div>
                              <label className="text-sm text-teal-700">
                                Name
                              </label>
                              <p>{selectedCred.name}</p>
                            </div>
                            <div>
                              <label className="text-sm text-teal-700">
                                Application Api
                              </label>
                              <p>{selectedCred.apiName}</p>
                            </div>

                            {/* Nested Data */}
                            {selectedCred.data &&
                              Object.entries(selectedCred.data).map(
                                ([key, value]) => (
                                  <div key={key}>
                                    <label className="text-sm text-teal-700 truncate capitalize">
                                      {key}
                                    </label>
                                    {isEditing ? (
                                      <Input
                                        value={
                                          String(formData.data?.[key] ?? value ?? "")
                                        }
                                        onChange={(e) =>
                                          handleChange(key, e.target.value, true)
                                        }
                                      />
                                    ) : (
                                      <p className=" max-w-[400px] truncate ">
                                        {String(value)}
                                      </p>
                                    )}
                                  </div>
                                )
                              )}
                          </div>
                        )}

                        {/* Save Button */}
                        {isEditing && (
                          <div className="flex justify-end mt-4">
                            <Button
                              onClick={handleSave}
                              className="bg-teal-600 hover:bg-teal-700 text-white"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  ))}
              </div>
            </div>
          </TabsContent>

          {/* Executions */}
          <TabsContent value="executions">
            <ExecutionsTabImproved />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
