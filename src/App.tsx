'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // ajuste o caminho se necessário
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInscricoes: 0,
    confirmados: 0,
    pendentes: 0,
    porEvento: {} as Record<string, number>,
    porProfissional: {} as Record<string, number>,
    satisfacaoMedia: 0,
    totalVendas: 0,
    reclamacoes: 0,
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        // 1. Inscrições (tabela principal - ajuste o nome se for diferente)
        const { data: inscricoes, error: err1 } = await supabase
          .from('inscricoes') // ← MUDE AQUI SE O NOME DA TABELA FOR OUTRO (ex: forms, leads, registros)
          .select('*');

        if (err1) throw err1;

        // 2. Conferência
        const { count: confirmados } = await supabase
          .from('inscricoes')
          .select('*', { count: 'exact' })
          .eq('status', 'confirmado');

        // 3. Satisfação
        const { data: satisfacao } = await supabase
          .from('satisfacao')
          .select('nota');

        // 4. Reclamações
        const { count: reclamacoes } = await supabase
          .from('reclamacoes')
          .select('*', { count: 'exact' });

        // Cálculos
        const total = inscricoes?.length || 0;
        const porEvento: Record<string, number> = {};
        const porProfissional: Record<string, number> = {};

        inscricoes?.forEach((i: any) => {
          porEvento[i.evento] = (porEvento[i.evento] || 0) + 1;
          porProfissional[i.profissional] = (porProfissional[i.profissional] || 0) + 1;
        });

        const mediaSatisfacao =
          satisfacao?.length > 0
            ? satisfacao.reduce((acc: number, s: any) => acc + s.nota, 0) / satisfacao.length
            : 0;

        setStats({
          totalInscricoes: total,
          confirmados: confirmados || 0,
          pendentes: total - (confirmados || 0),
          porEvento,
          porProfissional,
          satisfacaoMedia: Number(mediaSatisfacao.toFixed(1)),
          totalVendas: total * 297, // ajuste o valor do ingresso se precisar
          reclamacoes: reclamacoes || 0,
        });
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard Viva Alegria</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total de Inscrições</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-orange-600">{stats.totalInscricoes}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confirmados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{stats.confirmados}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-yellow-600">{stats.pendentes}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita Projetada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">
              R$ {stats.totalVendas.toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Inscrições por Evento</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(stats.porEvento).map(([evento, qtd]) => (
              <div key={evento} className="flex justify-between py-2 border-b">
                <span>{evento}</span>
                <span className="font-bold">{qtd}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Satisfação Média</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-6xl font-bold text-purple-600">{stats.satisfacaoMedia}/5</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
