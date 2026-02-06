/**
 * Utilitário para resolver a URL de animações Lottie
 * Resolve problemas de caminhos locais e erros de CORS no R2 via Proxy
 */
export function getLottieUrl(urlOrFile: string | null | undefined): string {
  if (!urlOrFile || urlOrFile === 'none') return '';
  
  // Se já for o caminho do proxy, retorna como está
  if (urlOrFile.includes('/api/animations/proxy')) return urlOrFile;

  // Se for uma URL externa (R2, LottieFiles, etc)
  if (urlOrFile.startsWith('http')) {
    return `/api/animations/proxy?url=${encodeURIComponent(urlOrFile)}`;
  }

  // Se for um arquivo local da pasta public/animations
  if (!urlOrFile.startsWith('/')) {
    return `/animations/${urlOrFile}`;
  }

  return urlOrFile;
}
