// app/dashboard/rifas/sorteio/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-context';
import { getRifa, realizarSorteio, getSorteio, type Rifa, type Sorteio } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Trophy, 
  Dice6, 
  ArrowLeft, 
  User, 
  Calendar, 
  Ticket,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function SorteioPage({ params }: { params: { id: string } }) {
  const [rifa, setRifa] = useState<Rifa | null>(null);
  const [sorteio, setSorteio] = useState<Sorteio | null>(null);
  const [loading, setLoading] = useState(true);
  const [sorteiando, setSorteiando] = useState(false);
  const [jaRealizado, setJaRealizado] = useState(false);

  const { token, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Unwrap params se for Promise
  // @ts-ignore
  const resolvedParams = typeof (React as any).use === 'function' ? (React as any).use(params) : params;
  const rifaId = resolvedParams?.id || (pathname ? pathname.split('/').filter(Boolean).pop() : undefined);

  useEffect(() => {
    if (!token || !user || user.role !== 'VENDEDOR') {
      router.push('/');
      return;
    }

    if (rifaId) {
      loadRifaAndSorteio();
    }
  }, [token, user, rifaId, router]);

  const loadRifaAndSorteio = async () => {
    if (!rifaId) {
      setLoading(false);
      return;
    }

    try {
      console.debug('[v0] Carregando rifa:', rifaId);
      const rifaData = await getRifa(rifaId);
      setRifa(rifaData);

      // Tenta buscar sorteio existente
      try {
        console.debug('[v0] Buscando sorteio existente para rifa:', rifaId);
        const sorteioData = await getSorteio(rifaId);
        setSorteio(sorteioData);
        setJaRealizado(true);
        console.debug('[v0] Sorteio encontrado:', sorteioData);
      } catch (error) {
        console.debug('[v0] Nenhum sorteio realizado ainda para esta rifa');
        setJaRealizado(false);
      }
    } catch (error) {
      console.error('[v0] Erro ao carregar rifa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados da rifa',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRealizarSorteio = async () => {
    if (!rifaId || !token) return;

    setSorteiando(true);
    try {
      console.debug('[v0] Realizando sorteio para rifa:', rifaId);
      const sorteioData = await realizarSorteio(token, rifaId);
      console.debug('[v0] Sorteio realizado com sucesso:', sorteioData);
      
      setSorteio(sorteioData);
      setJaRealizado(true);
      
      toast({
        title: '🎉 Sorteio Realizado!',
        description: `Número sorteado: ${sorteioData.numeroSorteado}`,
      });
    } catch (error: any) {
      console.error('[v0] Erro ao realizar sorteio:', error);
      const mensagem = error?.message || 'Erro ao realizar sorteio';
      toast({
        title: 'Erro',
        description: mensagem,
        variant: 'destructive',
      });
    } finally {
      setSorteiando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!rifa) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-bold mb-4">Rifa não encontrada</h1>
            <Button asChild>
              <Link href="/dashboard">Voltar ao Dashboard</Link>
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Voltar */}
          <Button variant="ghost" asChild>
            <Link href="/dashboard" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Link>
          </Button>

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <h1 className="text-4xl font-bold">Sorteio da Rifa</h1>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-muted-foreground text-lg">{rifa.titulo}</p>
          </div>

          {/* Informações da Rifa */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Rifa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Números</p>
                  <p className="text-2xl font-bold">{rifa.quantidadeNumeros}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Números Vendidos</p>
                  <p className="text-2xl font-bold text-green-600">{rifa.numerosVendidos}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Preço por Número</p>
                  <p className="text-2xl font-bold">R$ {rifa.precoPorNumero.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Arrecadado</p>
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {(rifa.numerosVendidos * rifa.precoPorNumero).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status do Sorteio */}
          {jaRealizado && sorteio ? (
            // Sorteio já realizado
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <CardTitle>Sorteio Realizado!</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Número Sorteado */}
                <div className="text-center space-y-4">
                  <div className="text-sm text-muted-foreground">Número Sorteado</div>
                  <div className="inline-flex items-center justify-center w-40 h-40 rounded-full border-4 border-green-600 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-900/10">
                    <div className="text-6xl font-bold text-green-600">
                      {sorteio.numeroSorteado.toString().padStart(4, '0')}
                    </div>
                  </div>
                </div>

                {/* Informações do Ganhador */}
                <div className="bg-white dark:bg-slate-950 rounded-lg p-4 space-y-3 border">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Ganhador</p>
                    <div className="flex items-center justify-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <p className="text-xl font-semibold">{sorteio.nomeVencedor}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium break-all">{sorteio.emailVencedor}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ID do Comprador</p>
                      <p className="font-mono text-xs">{sorteio.compradorVencedorId.substring(0, 8)}...</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Método</p>
                      <p className="font-medium capitalize">{sorteio.metodo}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Data do Sorteio</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <p className="text-sm">{new Date(sorteio.dataSorteio).toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>

                  {sorteio.observacoes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Observações</p>
                      <p className="text-sm bg-muted p-2 rounded">{sorteio.observacoes}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Hash de Verificação</p>
                    <p className="text-xs font-mono bg-muted p-2 rounded break-all">{sorteio.hashVerificacao}</p>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Sorteio realizado com sucesso! O ganhador foi notificado por email.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ) : (
            // Sorteio não realizado
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dice6 className="h-5 w-5" />
                  Realizar Sorteio
                </CardTitle>
                <CardDescription>
                  Clique no botão abaixo para realizar o sorteio da rifa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {rifa.numerosVendidos < rifa.quantidadeNumeros ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Atenção: Nem todos os números foram vendidos ({rifa.numerosVendidos} de{' '}
                      {rifa.quantidadeNumeros}). Mesmo assim, você pode realizar o sorteio.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Todos os {rifa.quantidadeNumeros} números foram vendidos! Pronto para sortear.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-6">
                    Um número será sorteado aleatoriamente entre os{' '}
                    <strong>{rifa.numerosVendidos}</strong> números vendidos
                  </p>
                  <Button
                    size="lg"
                    onClick={handleRealizarSorteio}
                    disabled={sorteiando}
                    className="gap-2"
                  >
                    {sorteiando ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sorteando...
                      </>
                    ) : (
                      <>
                        <Dice6 className="h-5 w-5" />
                        Realizar Sorteio
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
