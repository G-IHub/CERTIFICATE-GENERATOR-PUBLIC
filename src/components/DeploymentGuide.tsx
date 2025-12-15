import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, Copy, ExternalLink, Terminal } from 'lucide-react';
import { toast } from 'sonner';
import NotFound from './NotFound';

export default function DeploymentGuide() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <>
      <NotFound />
      {/* The actual deployment guide UI is not rendered since NotFound is shown */}
    </>
  );
}
