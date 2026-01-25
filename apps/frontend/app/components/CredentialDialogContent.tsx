"use client";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { BACKEND_URL } from "@/app/config/api";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/app/components/ui/select";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import type { CredentialsI, CredentialSubmitPayload } from "@/types/db";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Check, ExternalLink } from "lucide-react";

type CredentialDialogContentProps = {
  credApis: CredentialsI[];
  credName: string;
  currCredApi: CredentialsI | null;
  setCredName: (val: string) => void;
  setCredCurrApi: (val: CredentialsI) => void;
  onSuccess?: () => void;
};

export function CredentialDialogContent({
  credApis,
  credName,
  currCredApi,
  setCredName,
  setCredCurrApi,
  onSuccess,
}: CredentialDialogContentProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (currCredApi) {
      const initialValues: Record<string, string> = {};
      currCredApi.properties.forEach((prop) => {
        initialValues[prop.name] = prop.default ?? "";
      });
      setFormValues(initialValues);
    }
  }, [currCredApi]);

  const handleChange = (field: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!currCredApi) return;

    const payload: CredentialSubmitPayload = {
      name: currCredApi.displayName,
      apiName: currCredApi.name,
      appIcon: currCredApi.iconUrl,
      application: currCredApi.application,
      data: formValues,
    };

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/cred/`,
        payload,
        { withCredentials: true }
      );
      if (res) {
        toast.success("Credentials created successfully");
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Error saving credential:", error);
      toast.error("Failed to save credential");
    }
  };

  const handleContinue = () => {
    if (credName && currCredApi) {
      setStep(2);
    } else {
      toast.error("Please select a credential type");
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <DialogContent className="sm:max-w-[550px] bg-[#141414] border-white/10 text-white p-0 gap-0 overflow-hidden">
      {/* Header */}
      <DialogHeader className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          {step === 2 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8 -ml-2 mr-1 hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <DialogTitle className="text-xl font-semibold">
            {step === 1 ? "Add new Credentials" : currCredApi?.displayName}
          </DialogTitle>
        </div>
        <DialogDescription className="text-gray-400">
          {step === 1
            ? "Select the service you want to connect to."
            : `Configure your ${currCredApi?.name} connection.`
          }
        </DialogDescription>
      </DialogHeader>

      <div className="p-6">
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Credential Type</Label>
              <Select
                value={credName}
                onValueChange={(value) => {
                  const selected = credApis.find((c) => c.name === value);
                  if (selected) {
                    setCredName(value);
                    setCredCurrApi(selected);
                    setFormValues({});
                  }
                }}
              >
                <SelectTrigger className="w-full bg-[#1A1A1A] border-white/10 text-white focus:ring-teal-500/50 h-10">
                  <SelectValue placeholder="Select service..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                  {credApis.map((cred) => (
                    <SelectItem key={cred.name} value={cred.name} className="focus:bg-white/10 focus:text-white cursor-pointer">
                      <div className="flex items-center gap-2">
                        {cred.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && currCredApi && (
          <div className="space-y-6">
            {/* Documentation Widget */}
            {currCredApi.documentationUrl && (
              <div className="bg-teal-950/20 border border-teal-900/50 rounded-lg p-3 flex items-start gap-3">
                <div className="bg-teal-500/10 p-1.5 rounded-md mt-0.5">
                  <ExternalLink className="h-4 w-4 text-teal-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-teal-200">Need help?</h4>
                  <p className="text-xs text-teal-400/80 mt-1">
                    Check the <a href={currCredApi.documentationUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-teal-300">official documentation</a> for detailed instructions.
                  </p>
                </div>
              </div>
            )}

            {/* Google OAuth Special Case */}
            {currCredApi.name === "gmailOAuth2" && (
              <Button
                className="w-full bg-white text-black hover:bg-gray-200"
                onClick={() => {
                  window.location.href = `${BACKEND_URL}/api/v1/auth/google`;
                }}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-2" alt="Google" />
                Sign in with Google
              </Button>
            )}

            {/* Form Fields */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {currCredApi.properties.map((prop) => (
                <div key={prop.name} className="space-y-2">
                  <Label htmlFor={prop.name} className="text-sm font-medium text-gray-300">
                    {prop.displayName}
                    {prop.required !== false && <span className="text-red-500 ml-1">*</span>}
                  </Label>

                  {prop.type === "options" ? (
                    <Select
                      value={formValues[prop.name] || prop.default || ""}
                      onValueChange={(val) => handleChange(prop.name, val)}
                    >
                      <SelectTrigger className="w-full bg-[#1A1A1A] border-white/10 text-white focus:ring-teal-500/50">
                        <SelectValue placeholder={`Select ${prop.displayName}`} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                        {prop.options?.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="focus:bg-white/10 focus:text-white">
                            {opt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={prop.name}
                      type={prop.name.toLowerCase().includes("password") || prop.name.toLowerCase().includes("key") ? "password" : "text"}
                      placeholder={prop.placeholder}
                      value={formValues[prop.name] || ""}
                      onChange={(e) => handleChange(prop.name, e.target.value)}
                      className="bg-[#1A1A1A] border-white/10 text-white placeholder:text-gray-600 focus:border-teal-500/50 focus:ring-teal-500/20"
                    />
                  )}

                  {prop.description && (
                    <p className="text-xs text-gray-500">{prop.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="p-6 pt-2 border-t border-white/10 gap-2">
        {step === 1 ? (
          <>
            <DialogClose asChild>
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 bg-transparent">Cancel</Button>
            </DialogClose>
            <Button onClick={handleContinue} className="bg-teal-600 hover:bg-teal-700 text-white">
              Continue
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={handleBack} className="border-white/10 text-white hover:bg-white/5 bg-transparent">Back</Button>
            <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700 text-white">
              <Check className="w-4 h-4 mr-2" />
              Save Credentials
            </Button>
          </>
        )}
      </DialogFooter>
    </DialogContent>
  );
}
