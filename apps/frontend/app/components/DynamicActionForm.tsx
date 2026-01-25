"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { actionSchemas } from "@/app/lib/constant";
import { useState, useEffect } from "react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { Textarea } from "@/app/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";

interface DynamicActionFormProps {
    actionType: string;
    initialValues: any;
    onSubmit: (values: any) => void;
    onCancel: () => void;
}

export const DynamicActionForm = ({
    actionType,
    initialValues,
    onSubmit,
    onCancel,
}: DynamicActionFormProps) => {
    const schema = actionSchemas[actionType];
    const [formData, setFormData] = useState<any>(initialValues || {});

    useEffect(() => {
        setFormData(initialValues || {});
    }, [initialValues]);

    if (!schema) {
        return <div>No configuration available for this action type.</div>;
    }

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {schema.fields.map((field: any) => (
                <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name} className="text-sm font-medium">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>

                    {field.type === "text" && (
                        <Input
                            id={field.name}
                            value={formData[field.name] || ""}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            required={field.required}
                            className="bg-white/5 border-white/10 text-white focus:ring-1 focus:ring-white/20"
                        />
                    )}

                    {field.type === "textarea" && (
                        <Textarea
                            id={field.name}
                            value={formData[field.name] || ""}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            required={field.required}
                            className="bg-white/5 border-white/10 text-white focus:ring-1 focus:ring-white/20 min-h-[100px]"
                        />
                    )}

                    {field.type === "select" && (
                        <Select
                            value={formData[field.name] || ""}
                            onValueChange={(value) => handleChange(field.name, value)}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-1 focus:ring-white/20">
                                <SelectValue placeholder={field.placeholder || "Select option"} />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10">
                                {field.options.map((option: string) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {field.type === "toggle" && (
                        <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-lg border border-white/10">
                            <Switch
                                id={field.name}
                                checked={formData[field.name] || false}
                                onCheckedChange={(checked) => handleChange(field.name, checked)}
                                className="data-[state=checked]:bg-white/20"
                            />
                            <span className="text-sm text-gray-400">{field.description}</span>
                        </div>
                    )}

                    {field.description && field.type !== "toggle" && (
                        <p className="text-xs text-gray-500">{field.description}</p>
                    )}
                </div>
            ))}

            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="border-white/10 hover:bg-white/5 text-white"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="bg-white hover:bg-gray-200 text-black font-semibold"
                >
                    Save Changes
                </Button>
            </div>
        </form>
    );
};

export default DynamicActionForm;
