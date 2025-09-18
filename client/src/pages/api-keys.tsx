import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Eye, EyeOff, Key, Plus, Trash2, Activity, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ApiKey, InsertApiKey } from "@shared/schema";

// Form validation schema
const createApiKeySchema = z.object({
  keyName: z.string().min(1, "Key name is required").max(50, "Key name must be 50 characters or less"),
  scopes: z.array(z.string()).min(1, "At least one scope must be selected"),
  rateLimit: z.number().min(1, "Rate limit must be at least 1").max(10000, "Rate limit cannot exceed 10,000"),
  expiresAt: z.string().optional(),
});

type CreateApiKeyForm = z.infer<typeof createApiKeySchema>;

const scopeOptions = [
  { value: "read", label: "Read", description: "View asset data, market information, and analytics" },
  { value: "write", label: "Write", description: "Create alerts, manage watchlists, and update settings" },
  { value: "admin", label: "Admin", description: "Full access to all API endpoints and management" },
];

export default function ApiKeysPage() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Set<number>>(new Set());
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  // Fetch API keys
  const { data: apiKeys = [], isLoading, error } = useQuery({
    queryKey: ["/api/api-keys"],
    queryFn: () => fetch("/api/api-keys").then(res => res.json()),
  });

  // Fetch usage statistics
  const { data: usageStats = {} } = useQuery({
    queryKey: ["/api/api-keys/usage"],
    queryFn: () => fetch("/api/api-keys/usage").then(res => res.json()),
  });

  // Create API key mutation
  const createApiKeyMutation = useMutation({
    mutationFn: async (data: CreateApiKeyForm) => {
      const response = await apiRequest("/api/api-keys", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
        }),
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      setNewApiKey(data.fullKey);
      setShowCreateDialog(false);
      toast({
        title: "API Key Created",
        description: "Your new API key has been generated successfully. Make sure to copy it now!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create API key",
        variant: "destructive",
      });
    },
  });

  // Revoke API key mutation
  const revokeApiKeyMutation = useMutation({
    mutationFn: async (keyId: number) => {
      await apiRequest(`/api/api-keys/${keyId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      toast({
        title: "API Key Revoked",
        description: "The API key has been revoked successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke API key",
        variant: "destructive",
      });
    },
  });

  const form = useForm<CreateApiKeyForm>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      keyName: "",
      scopes: ["read"],
      rateLimit: 1000,
      expiresAt: "",
    },
  });

  const onSubmit = (data: CreateApiKeyForm) => {
    createApiKeyMutation.mutate(data);
  };

  const toggleKeyVisibility = (keyId: number) => {
    const newRevealed = new Set(revealedKeys);
    if (newRevealed.has(keyId)) {
      newRevealed.delete(keyId);
    } else {
      newRevealed.add(keyId);
    }
    setRevealedKeys(newRevealed);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <span>Failed to load API keys. Please try again.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Key Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your API keys for programmatic access to Silent Surge Tracker
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-create-api-key">
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for programmatic access. Choose appropriate scopes and rate limits.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="keyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="My Production App" 
                          {...field} 
                          data-testid="input-key-name"
                        />
                      </FormControl>
                      <FormDescription>
                        A descriptive name to help you identify this key
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="scopes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permissions</FormLabel>
                      <div className="space-y-2">
                        {scopeOptions.map((scope) => (
                          <div key={scope.value} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={scope.value}
                              checked={field.value.includes(scope.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange([...field.value, scope.value]);
                                } else {
                                  field.onChange(field.value.filter(v => v !== scope.value));
                                }
                              }}
                              className="rounded border-gray-300"
                              data-testid={`checkbox-scope-${scope.value}`}
                            />
                            <div>
                              <label htmlFor={scope.value} className="text-sm font-medium">
                                {scope.label}
                              </label>
                              <p className="text-xs text-gray-500">{scope.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rateLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate Limit (requests per hour)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="10000" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-rate-limit"
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of requests per hour (1-10,000)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiration Date (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field}
                          data-testid="input-expires-at"
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty for keys that never expire
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createApiKeyMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createApiKeyMutation.isPending ? "Creating..." : "Create Key"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* New API Key Display */}
      {newApiKey && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-300 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              API Key Created Successfully
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-400">
              ⚠️ This is the only time you'll see this key. Make sure to copy it now!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-900 rounded border">
              <code className="flex-1 font-mono text-sm" data-testid="text-new-api-key">
                {newApiKey}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(newApiKey)}
                data-testid="button-copy-new-key"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant="outline" 
              className="mt-3" 
              onClick={() => setNewApiKey(null)}
              data-testid="button-dismiss-new-key"
            >
              I've copied the key
            </Button>
          </CardContent>
        </Card>
      )}

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Your API Keys
          </CardTitle>
          <CardDescription>
            Manage and monitor your active API keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No API Keys
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You haven't created any API keys yet. Create your first key to get started.
              </p>
              <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-first-key">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First API Key
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Rate Limit</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key: ApiKey) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">
                      {key.keyName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm">
                          {revealedKeys.has(key.id) ? key.keyPrefix + "..." : key.keyPrefix + "••••••••••••••••"}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleKeyVisibility(key.id)}
                          data-testid={`button-toggle-visibility-${key.id}`}
                        >
                          {revealedKeys.has(key.id) ? 
                            <EyeOff className="h-4 w-4" /> : 
                            <Eye className="h-4 w-4" />
                          }
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(key.keyPrefix)}
                          data-testid={`button-copy-${key.id}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {key.scopes.map((scope: string) => (
                          <Badge key={scope} variant="secondary" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {key.rateLimit.toLocaleString()}/hr
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div data-testid={`text-usage-count-${key.id}`}>
                          {key.usageCount || 0} requests
                        </div>
                        {key.lastUsedAt && (
                          <div className="text-gray-500 text-xs">
                            Last: {formatDate(key.lastUsedAt)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {key.isActive ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          Inactive
                        </Badge>
                      )}
                      {key.expiresAt && new Date(key.expiresAt) < new Date() && (
                        <Badge variant="destructive" className="ml-1">
                          Expired
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(key.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => revokeApiKeyMutation.mutate(key.id)}
                        disabled={revokeApiKeyMutation.isPending}
                        data-testid={`button-revoke-${key.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Usage Analytics */}
      {apiKeys.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Usage Analytics
            </CardTitle>
            <CardDescription>
              Monitor API usage across all your keys
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {usageStats.totalRequests || 0}
                </div>
                <div className="text-sm text-gray-600">Total Requests</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {usageStats.requestsToday || 0}
                </div>
                <div className="text-sm text-gray-600">Requests Today</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {apiKeys.filter((k: ApiKey) => k.isActive).length}
                </div>
                <div className="text-sm text-gray-600">Active Keys</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
        <CardHeader>
          <CardTitle className="text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-700 dark:text-yellow-300">
          <ul className="space-y-2 text-sm">
            <li>• Never share your API keys in public repositories or client-side code</li>
            <li>• Use environment variables to store API keys securely</li>
            <li>• Regularly rotate your API keys, especially for production applications</li>
            <li>• Monitor your API usage and set appropriate rate limits</li>
            <li>• Revoke unused or compromised keys immediately</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}