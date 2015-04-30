package testes;

import br.com.estudo.modulo.dao.TipoCadastroDAO;
import br.com.estudo.modulo.modelo.TipoCadastro;
import org.junit.Test;

import java.util.Date;
import java.util.List;
import java.util.function.Consumer;

/**
 * Created by ton on 30/04/15.
 */
public class TipoCadastroDaoTest {

    @Test
    public void testInsert() {

        TipoCadastro entidade = new TipoCadastro();
        //entidade.setTipoCadastro(""); desnecessário quando é auto increment
        entidade.setDescricao(" Pessoa fisica");


        TipoCadastroDAO dao = new TipoCadastroDAO();
        dao.inserir(entidade);

    }


    @Test
    public void testListaTodos() {

        TipoCadastroDAO dao = new TipoCadastroDAO();


        List<TipoCadastro> lista = dao.listaTodos();

        lista.forEach(new Consumer<TipoCadastro>() {
            @Override
            public void accept(TipoCadastro tipoCadastro) {
                System.out.println(tipoCadastro);
            }
        });

    }


    @Test
    public void testConsultaPorChavePrimaria() {


        TipoCadastroDAO dao = new TipoCadastroDAO();

        TipoCadastro novo = dao.inserir(new TipoCadastro(" teste para consulta por chave primaria"));


        TipoCadastro pesquisado = dao.pesquisar(novo.getTipoCadastro());


        System.out.println(" cadastro encontrado pela chave: " + pesquisado);


    }


    @Test
    public void testAlteracao() {


        TipoCadastroDAO dao = new TipoCadastroDAO();

        TipoCadastro novo = dao.inserir(new TipoCadastro(" Registro para teste de alteração"));


        TipoCadastro alterado = dao.pesquisar(novo.getTipoCadastro());

        alterado.setDescricao(" alterado agora: " + new Date());

        dao.alterar(alterado);


        TipoCadastro recuperado = dao.pesquisar(alterado.getTipoCadastro());

        System.out.println(" cadastro encontrado pela chave: " + recuperado);


    }


    @Test
    public void testExcluxao() {

        TipoCadastroDAO dao = new TipoCadastroDAO();


        List<TipoCadastro> lista = dao.listaTodos();

        lista.forEach(new Consumer<TipoCadastro>() {
            @Override
            public void accept(TipoCadastro tipoCadastro) {

                TipoCadastroDAO daoExclusao = new TipoCadastroDAO();
                daoExclusao.excluir(tipoCadastro.getTipoCadastro());
            }
        });


    }
}
