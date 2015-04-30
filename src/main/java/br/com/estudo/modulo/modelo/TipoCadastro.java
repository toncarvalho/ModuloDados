package br.com.estudo.modulo.modelo;

import java.io.Serializable;

/**
 * Created by Vinicius on 30/04/2015.
 */
public class TipoCadastro implements Serializable {

    private String tipoCadastro;
    private String descricao;

    public String getTipoCadastro() {
        return tipoCadastro;
    }

    public void setTipoCadastro(String tipoCadastro) {
        this.tipoCadastro = tipoCadastro;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        TipoCadastro that = (TipoCadastro) o;

        if (!descricao.equals(that.descricao)) return false;
        if (!tipoCadastro.equals(that.tipoCadastro)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = tipoCadastro.hashCode();
        result = 31 * result + descricao.hashCode();
        return result;
    }

}
