import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageSpinner, Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth.store';
import { getInitials } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone')
    .optional()
    .or(z.literal('')),
});


export default function ProfilePage() {
  const { setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/auth/profile');
      return res.data.data;
    },
  });

  const profile = data?.user;

  const {
    register,
    handleSubmit,
    formState,
  } = useForm({
    resolver: zodResolver(profileSchema),
    values,
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.patch('/auth/profile', data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (data.data.user) setUser(data.data.user);
    },
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-3xl font-bold">Profile</h1>
      <p className="mt-1 text-muted-foreground">Manage your account settings</p>

      {/* Profile Card */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar} />
              <AvatarFallback className="text-lg">{getInitials(profile?.name || 'U')}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{profile?.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <p className="mt-1 text-xs capitalize text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3" /> {profile?.role}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Edit Form */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Edit Profile</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
          <CardContent className="space-y-4">
            {mutation.isError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {(mutation.error)?.response?.data?.error?.message || 'Update failed'}
              </div>
            )}
            {mutation.isSuccess && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                Profile updated successfully!
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile?.email} disabled />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register('phone')} placeholder="+923001234567" />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <Button type="submit" disabled={!isDirty || mutation.isPending}>
              {mutation.isPending ? <Spinner size="sm" className="mr-2" /> : null}
              Save Changes
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
