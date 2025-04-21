from fastapi import FastAPI, HTTPException, status
import logging
from pydantic import BaseModel
from transformers import pipeline, AutoTokenizer
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv()
token = os.getenv("HF_TOKEN")

MODEL_NAME = "pszemraj/flan-t5-large-grammar-synthesis"

try:
    grammar_check_model = pipeline(
        'text2text-generation',
        model=MODEL_NAME,
        tokenizer=AutoTokenizer.from_pretrained(MODEL_NAME)
    )
    logger.info(f"Modelo {MODEL_NAME} carregado com sucesso.")
except Exception as e:
    logger.error(f"Erro ao carregar o modelo de correção gramatical: {str(e)}")
    raise RuntimeError(f"Erro ao carregar o modelo de correção gramatical: {str(e)}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RedacaoRequest(BaseModel):
    tema: str
    redacao: str

@app.post("/api/corrigir")
async def corrigir_redacao(data: RedacaoRequest):
    try:
        logger.info("Iniciando correção da redação...")

        prompt = f"grammar: {data.redacao.strip()}"
        logger.info(f"Prompt para correção: {prompt}")

        corrigida = grammar_check_model(prompt)
        texto_corrigido = corrigida[0]['generated_text']
        logger.info(f"Texto corrigido: {texto_corrigido}")

        notas = {
            "gramatica": 200,
            "coesao": 200,
            "argumentacao": 200,
            "clareza": 200,
            "ortografia": 200,
        }

        erros_gramatica = 1
        erros_coesao = 1
        erros_argumentacao = 2
        erros_clareza = 1
        erros_ortografia = 1

        notas["gramatica"] -= erros_gramatica * 30
        notas["coesao"] -= erros_coesao * 40
        notas["argumentacao"] -= erros_argumentacao * 50
        notas["clareza"] -= erros_clareza * 30
        notas["ortografia"] -= erros_ortografia * 20

        notas = {k: max(0, v) for k, v in notas.items()}

        nota_final = sum(notas.values())
        
        nota_final = min(nota_final, 1000)

        feedback = f"Texto corrigido com sucesso! A redação apresenta alguns erros. Pontuação final: {nota_final}."

        competencias = [
            {"nome": "Gramática", "nota": notas["gramatica"], "descricao": "Erros gramaticais encontrados, incluindo concordância e pontuação."},
            {"nome": "Coesão", "nota": notas["coesao"], "descricao": "A redação apresentou falhas na coesão, afetando a fluidez das ideias."},
            {"nome": "Argumentação", "nota": notas["argumentacao"], "descricao": "A argumentação precisa ser mais estruturada e bem fundamentada."},
            {"nome": "Clareza", "nota": notas["clareza"], "descricao": "Clareza adequada, mas algumas ideias poderiam ser mais desenvolvidas."},
            {"nome": "Ortografia", "nota": notas["ortografia"], "descricao": "Erros ortográficos mais evidentes, dificultando a leitura."}
        ]

        return {
            "notas": notas,
            "nota_final": nota_final,
            "feedback": feedback,
            "texto_corrigido": texto_corrigido,
            "competencias": competencias
        }

    except Exception as e:
        logger.error(f"Erro ao processar a correção: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar a correção: {str(e)}"
        )

@app.get("/")
def read_root():
    return {"message": "Servidor rodando com sucesso!"}