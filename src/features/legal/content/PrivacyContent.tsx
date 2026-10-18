export function PrivacyContent() {
  return (
    <>
      <section className="flex flex-col gap-2">
        <h2 className="type-display text-lg text-ink">1. Quais dados coletamos</h2>
        <p>Ao registrar uma experiência, podemos coletar as seguintes informações:</p>
        <ul className="flex list-disc flex-col gap-1.5 pl-5">
          <li>nome ou apelido, faixa etária, cidade e bairro de moradia;</li>
          <li>
            condição/percepção informada voluntariamente, que pode incluir dados
            pessoais sensíveis relacionados a deficiência, neurodivergência ou
            mobilidade;
          </li>
          <li>localização da experiência, endereço ou ponto de referência;</li>
          <li>texto do relato, fotografias e áudios enviados;</li>
          <li>
            data e hora do registro e informações técnicas necessárias ao uso da
            plataforma.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="type-display text-lg text-ink">2. Para que usamos os dados</h2>
        <p>Os dados são utilizados para:</p>
        <ul className="flex list-disc flex-col gap-1.5 pl-5">
          <li>registrar, organizar e exibir os relatos no mapa e na leitura da paisagem;</li>
          <li>
            produzir análises, diagnósticos, pesquisas e materiais educativos sobre a
            experiência urbana;
          </li>
          <li>aprimorar a plataforma, sua usabilidade e seus conteúdos;</li>
          <li>cumprir obrigações legais e regulatórias aplicáveis.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="type-display text-lg text-ink">3. Base legal</h2>
        <p>
          O tratamento dos dados é realizado com base no consentimento do titular,
          inclusive para dados pessoais sensíveis, nos termos da Lei Geral de Proteção
          de Dados Pessoais (Lei nº 13.709/2018). O consentimento é manifestado no
          momento do aceite dos Termos de Uso e desta Política de Privacidade e pode
          ser revogado a qualquer momento pelos canais de contato.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="type-display text-lg text-ink">4. Compartilhamento</h2>
        <p>
          Não vendemos dados pessoais. As informações podem ser compartilhadas com
          prestadores de serviços necessários ao funcionamento da plataforma, como
          serviços de mapas, geocodificação e hospedagem, e com equipes de pesquisa
          envolvidas no projeto, sempre observando finalidades compatíveis com esta
          política.
        </p>
        <p>
          Resultados de análises podem ser divulgados de forma agregada ou anonimizada,
          sem identificação direta das pessoas participantes.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="type-display text-lg text-ink">5. Armazenamento e prazo</h2>
        <p>
          Nesta versão da plataforma, os relatos são armazenados no navegador do
          próprio dispositivo por meio de armazenamento local. As contribuições também
          podem ser consolidadas pela equipe do projeto para fins de pesquisa e
          publicação. Os dados serão mantidos pelo tempo necessário ao cumprimento das
          finalidades descritas nesta política ou conforme exigido pela legislação.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="type-display text-lg text-ink">
          6. Direitos do titular dos dados
        </h2>
        <p>
          Você pode solicitar, a qualquer momento, a confirmação da existência de
          tratamento, o acesso, a correção, a anonimização, o bloqueio ou a eliminação
          de dados, bem como revogar o consentimento. Para exercer esses direitos,
          utilize o canal <strong>Fale Conosco</strong> da plataforma.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="type-display text-lg text-ink">
          7. Cookies e armazenamento local
        </h2>
        <p>
          A plataforma utiliza armazenamento local do navegador para manter registros,
          preferências e o aceite dos termos. Você pode limpar esses dados nas
          configurações do seu navegador, o que pode remover relatos armazenados
          localmente e exigir um novo aceite dos termos.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="type-display text-lg text-ink">8. Segurança</h2>
        <p>
          Adotamos medidas técnicas e administrativas razoáveis para proteger os dados
          contra acessos não autorizados, perda, alteração ou divulgação indevida. No
          entanto, nenhum sistema é completamente imune a incidentes de segurança.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="type-display text-lg text-ink">9. Crianças e adolescentes</h2>
        <p>
          O uso da plataforma por crianças e adolescentes deve ocorrer com a ciência e
          a autorização de seus responsáveis legais, observando sempre o melhor
          interesse da pessoa menor de idade.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="type-display text-lg text-ink">10. Alterações</h2>
        <p>
          Esta política pode ser atualizada para refletir mudanças na plataforma ou na
          legislação. A versão vigente estará sempre disponível neste documento. Quando
          houver alterações relevantes, um novo aceite poderá ser solicitado.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="type-display text-lg text-ink">11. Contato</h2>
        <p>
          Para dúvidas, solicitações ou exercício de direitos relacionados à proteção
          de dados, utilize o canal <strong>Fale Conosco</strong> disponível na
          plataforma.
        </p>
      </section>
    </>
  );
}
