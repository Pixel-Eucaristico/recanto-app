'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, QrCode, Edit } from 'lucide-react';
import { PixPayload } from '@/utils/pix';

interface PixDisplayProps {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount?: string;
  description?: string;
}

export default function PixDisplay({
  pixKey,
  merchantName,
  merchantCity, amount, description }: PixDisplayProps) {
  const [currentAmount, setCurrentAmount] = useState(amount || '');
  const [isEditing, setIsEditing] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [payload, setPayload] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Update local state if prop changes (optional, but good practice)
    if (amount) setCurrentAmount(amount);
  }, [amount]);

  useEffect(() => {
    if (pixKey && merchantName && merchantCity) {
      const pix = new PixPayload({
        key: pixKey,
        name: merchantName,
        city: merchantCity,
        amount: currentAmount, // Use local state
        description,
      });

      const payloadStr = pix.getPayload();
      setPayload(payloadStr);

      QRCode.toDataURL(payloadStr, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Error generating QR Code', err));
    }
  }, [pixKey, merchantName, merchantCity, currentAmount, description]);

  const handleCopy = () => {
    if (navigator.clipboard && payload) {
      navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!pixKey) return <div className="text-center text-error">Chave Pix não configurada.</div>;

  return (
    <div className="flex flex-col items-center gap-6 p-4 max-w-sm mx-auto">
      {/* Header Info */}
      <div className="text-center space-y-1 w-full">
        <h3 className="font-bold text-lg text-base-content">{merchantName}</h3>
        
        {/* Editable Amount */}
        <div className="flex items-center justify-center gap-2">
            {isEditing ? (
                <div className="flex items-center gap-2">
                    <span className="font-bold text-success">R$</span>
                    <input 
                        type="text" 
                        autoFocus
                        className="input input-sm input-bordered w-24 text-center font-bold"
                        value={currentAmount}
                        onChange={(e) => {
                             // Allow only numbers and comma/dot
                             const val = e.target.value.replace(/[^0-9.,]/g, '');
                             setCurrentAmount(val);
                        }}
                        onBlur={() => setIsEditing(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') setIsEditing(false);
                        }}
                    />
                     <button onClick={() => setIsEditing(false)} className="btn btn-xs btn-circle btn-ghost">
                        <Check className="w-3 h-3 text-success" />
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
                    <p className="text-xl font-bold text-success">
                        R$ {currentAmount || '0,00'}
                    </p>
                    <button className="btn btn-xs btn-circle btn-ghost text-base-content/40" title="Editar valor">
                        <Edit className="w-3 h-3" />
                    </button>
                </div>
            )}
        </div>

        {description && <p className="text-sm text-base-content/70">{description}</p>}
      </div>

      {/* QR Code Card */}
      <div className="bg-base-100 p-4 rounded-xl shadow-lg border border-base-200">
        {qrCodeUrl ? (
          <img src={qrCodeUrl} alt="QR Code Pix" className="w-64 h-64 rounded-lg" />
        ) : (
          <div className="w-64 h-64 bg-base-200 animate-pulse rounded-lg flex items-center justify-center">
                <span className="font-mono text-xs">{pixKey}</span>
          </div>
        )}
      </div>

      {/* Copy Paste Code */}
      <div className="w-full space-y-2">
        <label className="text-xs font-semibold text-base-content/50 uppercase">Pix Copia e Cola</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            readOnly 
            value={payload} 
            className="input input-bordered input-sm flex-1 font-mono text-xs bg-base-200 text-base-content"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button 
            onClick={handleCopy} 
            className={`btn btn-sm btn-square ${copied ? 'btn-success' : 'btn-outline'}`}
            title="Copiar Código"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        {merchantCity && <p className="text-xs text-center text-base-content/40 mt-2">{merchantCity}</p>}
      </div>
    </div>
  );
}
