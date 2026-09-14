export const REGION_COORDINATES: Record<string, [number, number]> = {
  "São Paulo": [-23.5505, -46.6333],
  "Guarulhos": [-23.4538, -46.5333],
  "Campinas": [-22.9099, -47.0626],
  "Jundiaí": [-23.1857, -46.8978],
  "Sorocaba": [-23.5015, -47.4526],
  "São José dos Campos": [-23.1791, -45.8872],
  "Santos": [-23.9608, -46.3339],
  "Ribeirão Preto": [-21.1775, -47.8103],
  "São José do Rio Preto": [-20.8197, -49.3794],
  "Rio de Janeiro": [-22.9068, -43.1729],
  "Duque de Caxias": [-22.7856, -43.3117],
  "Niterói": [-22.8833, -43.1036],
  "Volta Redonda": [-22.5231, -44.1042],
  "Campos dos Goytacazes": [-21.7545, -41.3244],
  "Petrópolis": [-22.5112, -43.1779],
  "Belo Horizonte": [-19.9167, -43.9345],
  "Uberlândia": [-18.9186, -48.2772],
  "Contagem": [-19.9317, -44.0536],
  "Betim": [-19.9678, -44.1983],
  "Juiz de Fora": [-21.7642, -43.3503],
  "Uberaba": [-19.7483, -47.9319],
};

export function getRegionCoordinates(region: string): [number, number] | null {
  const coords = REGION_COORDINATES[region];
  return coords ?? null;
}