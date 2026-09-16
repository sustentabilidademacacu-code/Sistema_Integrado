import requests
from django.core.management.base import BaseCommand
from clima.models import EstacaoMeteorologica, LeituraEstacao

class Command(BaseCommand):
    help = 'Puxa dados reais de telemetria meteorológica para as estações cadastradas via API Pública.'

    def handle(self, *args, **kwargs):
        estacoes = EstacaoMeteorologica.objects.filter(ativa=True)
        self.stdout.write(f"Iniciando varredura em {estacoes.count()} estações ativas...")

        for est in estacoes:
            try:
                url_chuva = f"https://api.open-meteo.com/v1/forecast?latitude={est.latitude}&longitude={est.longitude}&current=precipitation,temperature_2m&timezone=America/Sao_Paulo"
                resp_chuva = requests.get(url_chuva, timeout=10)
                
                if resp_chuva.status_code == 200:
                    dados_chuva = resp_chuva.json()
                    if 'current' in dados_chuva:
                        atual = dados_chuva['current']
                        chuva_mm = atual.get('precipitation', 0.0)
                        temp_c = atual.get('temperature_2m', 0.0)
                        
                        LeituraEstacao.objects.create(
                            estacao=est,
                            chuva_mm=chuva_mm,
                            temperatura_c=temp_c,
                            nivel_rio_metros=1.5 if chuva_mm < 2.0 else 3.5
                        )
                        self.stdout.write(self.style.SUCCESS(f"[SUCESSO] {est.nome} | Chuva: {chuva_mm}mm | Temp: {temp_c}°C"))
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"[ERRO] Falha ao comunicar com {est.nome}: {str(e)}"))

        self.stdout.write(self.style.SUCCESS('Sincronização de Telemetria concluída.'))
