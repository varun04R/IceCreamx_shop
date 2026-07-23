import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Star, ThumbsUp, Trash2, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Review, IceCream } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { initials, timeAgo } from '@/lib/utils';

export function ReviewsPage() {
  const qc = useQueryClient();

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
      return (data ?? []) as Review[];
    },
  });
  const { data: iceCreams = [] } = useQuery({
    queryKey: ['ice_creams'],
    queryFn: async () => {
      const { data } = await supabase.from('ice_creams').select('id, name').order('name');
      return (data ?? []) as Pick<IceCream, 'id' | 'name'>[];
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (r: Review) => {
      await supabase.from('reviews').update({ likes: r.likes + 1 }).eq('id', r.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
  const delMutation = useMutation({
    mutationFn: async (id: string) => { await supabase.from('reviews').delete().eq('id', id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reviews'] }); toast.success('Review removed'); },
  });

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-sm text-muted-foreground">{reviews.length} reviews · {avgRating} avg rating</p>
        </div>
        <Card className="flex items-center gap-2 px-4 py-2">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          <span className="text-2xl font-bold">{avgRating}</span>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r, i) => {
          const ic = iceCreams.find((c) => c.id === r.ice_cream_id);
          return (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials(r.customer_name)}</AvatarFallback></Avatar>
                    <div>
                      <p className="text-sm font-medium">{r.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(r.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`h-3.5 w-3.5 ${j < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                    ))}
                  </div>
                </div>
                {ic && <p className="mt-2 text-xs font-medium text-primary">{ic.name}</p>}
                <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {r.comment}
                </p>
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <Button variant="ghost" size="sm" onClick={() => likeMutation.mutate(r)}>
                    <ThumbsUp className="mr-1 h-3.5 w-3.5" /> {r.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => delMutation.mutate(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
        {reviews.length === 0 && <p className="py-20 text-center text-muted-foreground col-span-full">No reviews yet.</p>}
      </div>
    </div>
  );
}
