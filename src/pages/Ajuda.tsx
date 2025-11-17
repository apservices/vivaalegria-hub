import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Book, MessageCircle, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const Ajuda = () => {
  const helpTopics = [
    {
      icon: Book,
      title: "Como configurar a integração com JotForm",
      description: "Aprenda a conectar sua conta JotForm e importar dados dos formulários",
    },
    {
      icon: MessageCircle,
      title: "Entendendo o Dashboard",
      description: "Guia completo sobre os indicadores e métricas exibidos no painel principal",
    },
    {
      icon: Mail,
      title: "Gerenciamento de eventos",
      description: "Como cadastrar, editar e acompanhar eventos no sistema",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Central de Ajuda</h1>
        <p className="text-muted-foreground mt-1">
          Documentação e suporte para usar o sistema
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {helpTopics.map((topic, index) => (
          <Card key={index} className="shadow-soft hover:shadow-card transition-all hover-scale cursor-pointer">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gradient-primary">
                  <topic.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{topic.title}</CardTitle>
                  <CardDescription className="mt-1.5">
                    {topic.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Precisa de mais ajuda?</CardTitle>
          <CardDescription>
            Entre em contato com nossa equipe de suporte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="bg-gradient-primary">
              <Mail className="mr-2 h-4 w-4" />
              Enviar Email
            </Button>
            <Button variant="outline">
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat ao Vivo
            </Button>
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Documentação Completa
            </Button>
          </div>

          <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-foreground mb-1">
                  Perguntas Frequentes
                </h4>
                <p className="text-sm text-muted-foreground">
                  Visite nossa base de conhecimento para encontrar respostas rápidas para as dúvidas mais comuns.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Ajuda;
